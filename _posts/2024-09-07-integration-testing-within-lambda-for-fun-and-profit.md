---
layout: post
title: "Integration Testing Within Lambda For Fun and Profit"
date: 2024-09-07 09:18:28
categories: devops talks
---
## Abstract
This post serves to document some of the approaches I took to solve some issues integration tests I ran into recently, and how this approach may or may not help you

## The Problem At Hand: Testing The Database Layer
Consider the following: you're building an API that uses some external data store to provide functionality. Maybe it uses an RDBMS like PostgreSQL, or perhaps a different model like Redis or Dynamo.
The code you write that interacts with that data store is critical to the successful operation of that service, and if possible, you should test it heavily.
However, there's trade-offs to be made: if you test against your data store by mocking or faking it out, you potentially miss out on behavioral intricacies of the data store itself and fail to catch some integration bugs. If you test against the data store itself, it's tricky to set up and potentially could risk mangling data you want to protect.

## An Initial Unit Testing Approach
A traditional unit testing approach would suggest that you _mock_ out that data store and write tests and assertions that confirm that your code makes the proper calls to that database. However, this doesn't necessarily capture a lot of ways mistakes and bugs can occur. Consider this (very contrived) test case:

```javascript
const dataLayer = require("./data-layer.js");

it("should call mysql correctly", async () => {
  const connection = createMysqlDatabaseMock();
  // set up the mock to returned some "canned" query results
  connection.query.returnValue = [
    { id: 1, name: "first" },
    { id: 2, name: "second" },
  ] 

  // the actual function we're testing
  const result = await dataLayer.getUsers(connection);
  expect(result).to.deep.equal([
    { id: 1, name: "first" },
    { id: 2, name: "second" },
  ]);
});
```

In some respects this test adds some value by making sure the data layer does indeed call `connection.query` under the hood.
However, you can see some of the cracks in this test: we're duplicating that mock data a little bit.
Yes, we could extract a variable, but the duplication there is a bit of indicator that maybe we could do this better

## A Better Unit Test
We could maybe improve this test by making our data layer mock a little smarter:
```javascript
let db
before(async () => {
  connection = createMysqlDatabaseMock();

  await connection.insert({ id: 1, name: "first" });
  await connection.insert({ id: 2, name: "second" })
});

it("should call mysql correctly", async () => {
  const result = await dataLayer.getUsers(connection);
  expect(result).to.deep.equal([
    { id: 1, name: "first" },
    { id: 2, name: "second" },
  ]);
});
```

In this case, maybe that `insert` call would put those records into an in-memory store that `query` pulls from. Something like this:
```javascript
function createMysqlDatabaseMock() {
    return {
        records: [],
        insert: function(record) {
            this.records.push(record);
        },
        query: function() {
            return this.records;
        }
    };
}
```

This is a bit nicer, and if we were using typing, could allow us to think in terms of our domain model: Maybe `query` could return a `User[]` instead!

However, in my experience, this test still doesn't help us a bunch.
What typically has bitten me in my data layer, are things like:
- I wrote an invalid SQL statement that the database can't parse
- I messed up the networking configuration, and the service can't even talk to the database
- I didn't populate/load database credentials properly and so the service is using the wrong (or no) password to connect to the database
- I made an invalid assumption about the format in which the data comes back from the database: I thought it was a list, but it was an object with a list in a certain field (like `results` e.g.)

If the test were to communicate with a real instance of your database, that'd potentially give you much more confidence about the data layer's correctness.
How might we do this?

## Some Options for Using a Real Data Store

### Option 1
One option is that our local test has (or can get) credentials to the data store and talks directly to the data store from local tests. 
This is nice because the credential fetching probably matches what the code for the application would do anyways (and is therefore reusable) and is easy to set up as a result.
This also means you can quickly write and iterate on tests locally.
However, that means that your local setup will also need access to the database you're testing against.
This may be unacceptable from a security standpoint depending on your application.
Moreover, if we were to run these tests on a build server, that build worker would _also_ need access to that database.
Depending on your choice of CI server, that may mean granting some external party like GitHub Actions access to your database, at least from a networking standpoint.
This may especially be a no-go.

### Option 2
Another option is that we run the test suite _inside_ of the actual infrastructure that hosts the application.
One benefit of this approach is that the application already has the "right" permissions set up to communicate with the data store, so the test suite inherits that automatically.
The test suite will now also better capture configuration issues like firewall rules, environment variables, etc. which are the principal thing I seem to mess up when setting things up anyways.
An obvious downside, however, is that this is going to clearly be harder to setup.
There's a couple of questions that arise:
- How do we invoke the test suite?
- How do we prevent _other people_ from invoking the test suite?

### Option 2.5
This following approach is the one I've settled on in the past, and seen many teams implement.
In essence we create a _clone_ of our application's compute infrastructure (think Lambda Function, Container Service, or a VM).
We then create an entrypoint for invoking the tests and control that entrypoint via permissions.
This could be an API call, or the container entrypoint script, or an event passed to a Lambda function, but what's nice is that most cloud providers have permissions based around _invocation_ so we can lock down who exactly can call that entrypoint.

There are, of course, caveats!
First of all, because this is separate infrastructure we'll need to be careful to keep the application's and test's permission-set in-sync.
This can be achieved with a shared policy, or via shared code for generating the policy.

However, this also provides a hidden benefit:
Consider the case where the app is read-only, but needs test data in order to confirm reads work.
In this case, the app could have read-only permissions, whereas the tester would have write permissions in addition to read-only permissions.
In AWS, IAM policies can handle this elegantly with an "application policy" and a "tester policy".
The app would only have the first, and the tester would have both.
As the application's permissions change, the test runner's would too.
This can help cases where an application permission change breaks integration in some way: the tester would have the same "busted" permissions and presumably would fail performing some database operation it needed.

## Testing a Lambda's Data Layer
The easiest example to show is using AWS Lambda functions.
Consider this little lambda that takes some input, reads from Dynamo, and then returns a response:

```javascript
// index.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

async function findAge(name) {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const command = new GetCommand({
        TableName: "users",
        Key: { name },
    });

    const response = await docClient.send(command);

    return response.Item.age;
}

async function handler(event) {
    // Request parsing
    const { name } = event;

    // Database calls
    const age = await findAge(name);

    // Response formatting
    const response = { age };
    return response;
}

module.exports = { findAge, handler };
```

Note how I've structured this:
- The database calls are independent from where the data comes from. I could technically call `findAge` from somewhere else without using the lambda's event parsing in `handler`.
- `handler` makes a clear distinction between three important steps:
  - Parsing the input
  - Using the parsed input to do some (boring) business logic and get some output.
  - Formatting the output and sending it back to the caller

This structuring sets us up really well for the following:
- We can now test `findAge` more easily: We don't have to write a test that properly formats lambda events, but rather just queries the database with some raw data.
- We could later on extract the logic in `handler` for parsing and formatting to be separate functions and modules. The logic may become more complicated and benefit from a unit, or even integration test or two.

### Testing `findAge`
So, here's what an initial test would like using mocha and chai (but other frameworks would look pretty similar):
```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const { findUser } = require("../src/index.js");

describe("findAge", () => {
    // put some test data in the database
    before(async () => {
        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        await docClient.send(new PutCommand({
            TableName: "users",
            Item: {
                name: "testuser",
                age: 100, // the good die young
            }
        }))
    });

    // Yes, we SHOULD have an after to clean up this data, but for brevity's sake...

    it("should return the value in the database", async () => {
        const age = await findUser("testuser");
        assert.ok(age === 100, `Expected age to be 100 got ${age}`);
    });

    // An exercise for the reader :D
    it("should return a suitable fallback when there is no data");
});
```

This test is nice and simple, although the setup is a little verbose.
However, we're now faced with our initial problem: how do we run this?

### A Lambda-based Test Harness
Following my suggestion above, let's make a _second_ lambda that can run our test suite.
We'll control who has `Invoke` permissions, carefully, but the function will do only that one thing: run our test suite.

Typically, when running a test suite with something like `mocha` you'll invoke it as a CLI command:
```
$ mocha tests/**/*.test.js
```

In our case, our lambda function will need to perform the invocation of that test suite ourselves.
This also means that the lambda "package" will include not only your source code (perhaps in `src`) but your tests as well (in `tests` maybe)!
Here's how we might do that:
```javascript
// tests/entrypoint.js

const Mocha = require("mocha");
const { glob } = require("glob");

module.exports.handler = async function(event) {
    // first find all test files
    // Note this is already in tests, so we can omit that part of the path
    const globPath = path.join(__dirname, "**", "*.test.js");
    const files = await glob("**/*.test.js");
    
    // Build a test suite and add all those tests
    const mocha = new Mocha();
    for (const file of files) {
        mocha.addFile(file);
    }

    // Run the test suite, and return a response to the caller with test
    // statistics
    return new Promise(resolve => {
        const runner = mocha.run(() => {
            // This inner callback is called when tests complete
            // mocha.run() returns a runner which has test completion stats
            resolve(runner.stats);
        });
    })
}
```

### Invocation
Using that as the entrypoint for an AWS Lambda allows you to execute it
like this:
```
$ aws lambda invoke --function-name="my-test-function" --invocation-type="RequestResponse"
{
    "suites": 1,
    "tests": 2,
    "passes": 1,
    "pending": 1,
    "failures": 0,
    "start": "2020-01-01T00:00:00.000Z",
    "end": "2020-01-01T00:00:01.000Z",
    "duration": 1000
}
```

The output from the function is mocha's test statistics, from which you can then build assertions, logging, metrics, etc.
Best of all, your CI server only needs invocation permissions on this lambda.
You could also update that handler to accept arguments to run specific suites, sub-tests, etc.

## Conclusion
The goal of all this work is to run integration tests in an environment that mimicks how the code being tested would be actually ran.
This adds some complexity: things like duplicate infrastructure and a more complex testing harness can obscure the original intention and potentially make writing tests harder.
However, this approach has the potential to help catch bugs you wouldn't otherwise catch until production (speaking from experience) with not that much more infrastructure.
Assess the tradeoffs for yourself, and perhaps this may be helpful for you.
Happy coding!