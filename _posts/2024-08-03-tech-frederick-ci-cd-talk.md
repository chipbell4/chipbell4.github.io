---
layout: post
title: "An Opinionated Introduction to CI/CD"
date: 2024-07-03 19:00:00
categories: devops
---

## Abstract
CI/CD is a set of practices used by engineering organizations to improve the quality of software they deliver, how fast they deliver that software, and detect issues with that software before they affect end users.
Unfortunately, the term can mean a lot of different ideas and approaches.
So, in this talk we're going to try to unravel some of those ideas to give you some ideas on how you too can deliver software better.
I'll also give you some links to some tooling so you can see how it's done.

## What Does CI/CD Even Mean?
CI/CD typically stands for "Continuous Integration/Continuous Delivery" or "Continuous Integration/Continuous Deployment".

There's three-ish terms here, so let's figure out what those mean, then figure out what that means for our code and engineering practices.

### Continuous Integration
Continuous Integration typically refers to "integrating changes to a code base seamless as they occur".
For instance, if you build a new feature on your website, adding that feature into the main working codebase should be as effortless as possible.
Something like this:

<div style="background: #ccc">
{% mermaid %}
gitGraph
    commit
    commit
    branch bugfix/button-color
    checkout bugfix/button-color
    commit id: "Make Button Pink"
    commit id: "Button Color Unit Test"
    checkout main
    merge bugfix/button-color
    commit
    commit
{% endmermaid %}
</div>

These days, source control tools like [`git`](https://git-scm.com) (and all of the ecosystem on top of it like [GitHub](https://github.com) or [BitBucket](https://bitbucket.org)) make that easy.
Most web-based tools on top of git support "pull requests" which not only make integration a single button click, but also allow peer-review and security checking.

_**Lesson: Use source control!**_


#### What Does "Continuous" Mean Here?
The goal is lowering friction for changes to make it into the main code base. There's a couple of ways to look at this:

##### Continuous Means "Every Change Makes It Into The Work Branch Automatically"
- No reviews! The build process does all verification 
- Good: This is fast and impartial.
- Bad: Reviews (_when done well_) can be an opportunity for team discussions on approaches and software "vision" even!

##### Continuous Means "Changes Are Integrated Quickly"
- Okay, so reviews are back, but we keep the build process. The reviews can't sit for very long though!
- Good: Reviews can also help catch bugs, and logic errors that tests might miss (the tester's assumptions could be wrong!)
- Bad: Reviews can be slow. The longer a change sits waiting on review before integration the greater the risk that the changes become difficult to integrate (read "merge conflicts").

##### Okay, Just Tell Me What I'm Supposed
IDK, it depends! My take-away for you is:

_**Lesson: The spirit of CI is to facilitate changes going into the code base. Figure out what works best for your team**_

### Continuous Delivery
Continuous Delivery refers to the idea that when changes are made, they are verified and build into an artifact that users could consume (even if it's not accessible to them).

Some examples:
- You change the templates on your website to make the background blue. The build process creates a new copy of your website with the blue page, ready to be uploaded to your server.
- You fix a crucial bug in an API and commit. When you push, a build worker server runs a `docker build` command and generates a container image that you can then use to deploy the update.
- You add a new feature to your Android app. The build server picks up the change and generates a new Android package file (.apk) that can be installed directly to your test devices.

#### Why Is This Good
Automating the artifact generation process:
- Frees up time for you to do other things
- Prevents human error
- Makes it consistent

#### Some Gotchas
- You need checks in place to prevent building a _bad artifact_. For instance, if tests fail, don't build the artifact. Fail the build and _let someone know_.

#### Take-aways
_**Lesson: Any "good" source code should turn into an artifact automatically. If it's bad, it shouldn't and someone should be alerted**_

_**Corollary: Automate your build. All of it. No manual steps, ever.**_

### Continuous Deployment
Continuous Deployment is the next step: the automatically generated artifacts we just talk about should be automatically deployed.

So, the process looks like this now:
- A developer makes a change and commits it.
- The change is seamlessly integrated into main working branch.
- A build server picks that change up, and runs an automated build that generates a deployable artifact.
- The artifact is then automatically deployed

#### What Does "Deployment" Mean?
Deployment can mean multiple things. Here's a few examples:
- Your website code changes are automatically deployed; after your change the website background color becomes blue in a few minutes.
- Your bugfixes to your API are tested and then the API is _automatically updated_. The bugfix goes live as long as tests pass.
- Your new Android app feature is uploaded automatically to the Google Play store and released to alpha testers.

#### Seems Kinda Risky, Right
Right!

What if there's a bug? What if it goes live and you realize that there's a big problem with the change? Now, what?

_**Lesson: You need to have a rollback procedure, and you need to test it periodically.**_

_**Lesson: Any bugfix or new feature should have a test if possible. This is more an art than science sometimes.**_

_**Corollary: You can automate that rollback based on metrics/continuously running tests, too.**_

_**Corollary: If and when you (or the robots) rollback, someone should be notified.**_

### Leveling-Up: Pipeline Deployments
There's a major risk associated with a change going directly to users.
There may be a hidden bug, or the change may conflict with another in-flight feature. What to do?


Enter "pipeline deployments". Changes made by developers propagate step-by-step until they finally reach users.
What are those "steps" though?

#### Level 1: Stages
One option you might do is create deployment "stages" that mimic the customer-facing environment more and more until it finally reaches the actual main environment.
For example, initial deployments might go to a "development" environment which only developers can see.
There may be little verification before allowing a change here (so that devs can play with new features).
However, another test suite may be ran before "promoting" to a "staging" environment that closely resembles production.
Once another round of tests pass, the changes are then promoted to production. Something like this:

<div style="background:#ccc">
{% mermaid %}
flowchart LR
    git[(Source Code)]
    build[[Build Server]]
    dev[/Development Environment/]
    staging[/Staging Environment/]
    prod[/Production Environment/]

    git -- Developer makes changes --> build
    build -- Basic Tests Pass --> dev
    dev -- Higher-Level Tests Pass --> staging
    staging -- Load Tests, E2E, etc Pass --> prod
{% endmermaid %}
</div>

##### Aside: What Tests Run Where?
There is no right answer here.
The goal of the tests is to ensure you are confident things are "good enough" to go to the next stage.
The secret second goal, is to automate that confirmation and not rely on humans to check things are good enough.

_**Lesson: Figure out what types of tests you need to feel confident the changes are good enough to promote**_

We'll talk about what sort of tests you can run in a bit.

##### How Many Stages?
In the above example, I have development, staging, and production.
That may be overkill for your situation, or not enough!
It's important that you identify _why_ you have each stage and their intended goal.

_**Lesson: The purpose of CI/CD is to improve time to deployment. Figure out which stages you might need and remove unneccessary ones**_

For instance, if you run the same tests to promote to two different stages, what do you gain from that second stage?

#### Level 2: Weighted Deployments
Level 1 is probably enough for most people. But... this may be helpful for your use-case!

You may want to create a production stage that only rolls out to a percentage of end-users, hosts, locations etc. first before deploying everywhere.
This is called a _Canary Deployment_.
This prevents a breaking change from affecting many customers at once, but you'll still need a testing strategy for this new "phantom" stage in your pipeline.
Here's what it'll look like:

<div style="background:#ccc">
{% mermaid %}
flowchart LR
    git[(Source Code)]
    staging[/Staging Environment/]
    canary[/N% of Production Hosts/]
    prod[/All Production/]

    git -. All That Other Stuff .-> staging
    staging -- Load Tests, E2E, etc Pass --> canary
    canary -- API Metrics, Error Rates, etc --> prod
{% endmermaid %}
</div>

#### Level 3: Regional Roll-Outs
Okay, another idea is that you can roll-out regionally.
Similarly to the above, rolling out to all production at once could be risky if there's a bug.
So, you roll out region-by-region, verifying along the way.

For instance, your team may deploy your API to the East Coast, West Coast, South Asia, and Europe.
You might split your pipeline like this:

<div style="background:#ccc">
{% mermaid %}
flowchart LR
    staging[/Staging Environment/]
    east[/East Coast/]
    west[/West Coast/]
    asia[/South Asia/]
    europe[/Europe/]

    staging -- Load Tests, E2E, etc Pass --> east
    east -- Health Checks, Error Rates Metrics, etc --> west
    west -- Health Checks, Error Rates Metrics, etc --> asia
    asia -- Health Checks, Error Rates Metrics, etc --> europe
{% endmermaid %}
</div>

#### Level 4: Mix-and-Match
Depending on your needs, you can mix and match these ideas and make some serious monstrosities.
Remember, "brevity is the soul of wit", so don't add stages you don't need.

#### Continuously Integrating and Deploying at the Same Time
There's a push-and-pull happening here:
- You want to merge often
- You want to deploy often
- New features sometimes take a little time.
- You don't want to deploy something incomplete.

What do you do?

[Feature flags](https://martinfowler.com/articles/feature-toggles.html) are a good answer to this problem
There's a couple of ways to do this, but feature flags can basically allow you to "toggle off" a feature.
If a feature is still in development, add a flag to disable while you build it.
Once it's ready, you can enable it in a deployment.
And if there's an issue, your rollback process will toggle it off successfully.

#### Tests
I've mentioned testing alot here, but I think it's worth discussing the types of tests that you could write to help build confidence in your system.
Moreover, it's a good idea to discuss _when_ those tests might be ran so that they deliver the most value for you. YMMV.

These defintions below are _mine_, so you may find slightly different ones online! Some of these aren't actually "tests" but tooling you might use to check software quality.

- **Unit Tests** test an isolated part of your code. Fast to run, so should be ran early. Example: tests your phone number validation logic.
- **Static Analysis/Compilation/Type Checking** is a prequisite for an artifact more than likely, so should be one of the first things you run. Example: checks your code that you always pass a `string` to the phone number validation logic
- **Integration Tests** test the interaction between components. Example: checks that your database interaction code that updates a user's phone number in the database persists correctly.
- **End-to-end Tests** test some workflow from start to finish. Example: checks that the form on your website, when submitted properly updates a user's phone number.
- **Performance/Load Tests** make many calls to an API, to attempt to make sure the service can handle a certain amount of load. Example: a test could attempt to update a user's phone number many times a second and make sure the service doesn't degrade.
- **Visual Regression Tests** make sure the visual look of the UI didn't change during a deploy. Example: a test could compare a picture of the phone number update form between updates to confirm it looks the same.
- **Health Checks** make sure an already deployed service is still healthy. Example: A test may periodically call the phone number API to confirm a specific API response and fail otherwise.
- **Metrics/Monitoring** can make sure your service is behaving "normally", or detect when something unexpected has occurred. Example: An alarm could notify the team if the phone number request count drops below some threshold.

#### What Tests When?
Here's my personal opinion on this:

<div style="background:#ccc">
{% mermaid %}
flowchart LR
    git[(Source Code)]
    build[[Build Server]]
    dev[/Development/]
    staging[/Staging/]
    prod[/Production/]

    git -- Code Changes --> build
    build -- Unit Tests, Static Analysis/Compilation --> dev
    dev -- Integration Tests, Faster E2E Tests --> staging
    staging -- Load Tests, All E2E, Health Checks, Load Testing --> prod
{% endmermaid %}
</div>

(Note you'll also continuously run health checks and monitoring on production as well)

### Tools of the Trade
Here's a few tools (not exhaustive) that people have used to do CI/CD:
- [Jenkins](https://www.jenkins.io): Essentially an automation server. Can be used for running builds, doing deployments etc. Builds and pipelines can be defined in Groovy, shell scripts, or via the GUI.
- [GitHub Actions](https//github.com/features/actions): A GitHub feature that allows you to define workflows in a custom YAML format. Can be chained for creating pipelines, but can also be used for one-off workflows.
- [Dagger](https://dagger.io): a toolbox for building CI/CD pipelines defined in code. Also has an engine for running you build on a container fleet.
- [AWS CodePipeline](https://aws.amazon.com/codepipeline/): AWS's offering for defining deployment pipelines as code.
- [Azure Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines/): Azure's CI/CD offering
- [Google Cloud Build](https://cloud.google.com/build): Google's CI/CD offering
- [CircleCI](https://circleci.com): CI/CD SaaS.


Pro-tip: You can also use a bunch of thrown-together shell scripts and do it yourself (I'm only half joking).

### The Big Takeaways
- CI/CD is an _approach_ not an ordained set of "do this not that".
- The goal is to improve the time it takes for changes to get from a developers hands to a user while catching issues automatically
- Doing all the things I've outlined probably isn't feasible for your team. You've got other stuff to do! However, look at these different approaches and figure out what _delivers the most value for your team_ and prioritize implementing them. Even something like automating your build can deliver lot's of value to your team. 
- It's helpful to approach everything with an "Agile Mindset": Improve your deployments iteratively. Allocate a little time every once in a while to make small improvements and they will add up. Rising tides lift all boats.
