---
layout: post
title: "Using Generators To Split Work"
date: 2022-05-01 16:02:40
categories:
---

<script src="/assets/js/generators-split-work.js"></script>

## Introduction
ES6 introduced quite a few features, but one that I almost overlooked was _generator functions_.
For Python folks, this may be a pretty familiar concept, but having this functionality baked into the JavaScript language is a huge step forward.
In this post, I'll demonstrate _what_ this language feature is, and how we can use it to improve the performance of a long-running task.

## What are generator functions
So, what even _are_ generator functions?
Well, the short answer is that they're functions that return a "generator".
That is, they're a function that "yields" values back to it's caller incrementally.
In a way, it's as if the function is returning multiple values as it goes until it hits the final `return` or the bottom.
An example will help:

```javascript
function *generatorTest() {
  yield 1;
  yield 2;
  return 3;
}

const gen = generatorTest();
console.log(gen.next()); // logs { value: 1, done: false }
console.log(gen.next()); // logs { value: 2, done: false }
console.log(gen.next()); // logs { value: 3, done: true }
```

So, the function doesn't return an immediate value, but rather returns a ["generator" object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).
With this object, you can call `.next()` on it to get an object containing the next value to be `yield`-ed from the function.
Once the function is out of values, it'll begin yielding an object with a `done` value of `true`.

Worth noting is that this works automatically within for loops:
```javascript
for (const value of generatorTest()) {
  console.log(value);
}

// Logs:
// 1
// 2
```
but the _return value isn't returned_. Keep that in mind!

With just this functionality, I can think of a couple of interesting use cases:

### Generating an Infinite List
Generators are a great candidate for infinite lists of things.
Check out this one for generating squares:
```javascript
function* squares() {
  let x = 0;
  while (true) {
    yield x * x;
    x++;
  }
}
```

There are infinite integers, so this "list" is technically infinite too (ignoring integer overflow).

### "Un-paginating" API Responses
Some APIs will return results in "pages" in cases where returning _everything_ would be too large of a response.
Consider this example:
```javascript
// This function makes a call to the API and returns the n-th page
function getPage(n) {
  // do stuff....
  return {
    items: [item1, item2, ..., /* etc */],
    lastPage: someBooleanValue,
  };
}

function* getAllPages() {
  let n = 1;
  let isLastPage = false;

  do {
    // get the current page
    response = getPage(n);

    // yield what we have in the current page
    for (const item of response.items) {
      yield item;
    }

    // if it's the last page, we'll break out of the loop
    isLastPage = response.lastPage;
  } while(!isLastPage);
}
```

The `getAllPages` function essentially "hides" the pagination from the caller.
The caller invokes `getAllPages` and gets a generator back.
Whenever a new page is needed, the internals of the function figure that out and make the API call and the caller is none the wiser.
This is a really nice way to build an API client since it allows the client to focus on business logic, rather than the bookkeeping of fetching the next page.

## A potentially slow example function
Okay, now that we know what generators are, how can they help us with performance?
Check out the function below.
All it does is add up the products of numbers from 0 to some (potentially large) `n`:
```javascript
function squareSum(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        sum += i * j;
    }
  }
  return sum;
}
```
For a very large `n`, this could take quite a bit.
Moreover, running this code as-is in the browser will potentially lock up the UI since it would run on the UI thread by default.
If it takes _too_ long, the browser will think the page is frozen and happily stop it.
So, we need a solution.

### Web Workers?
Okay, okay, [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) are now the obvious solution here.
We could send `n` over to a worker and let it respond whenever it wraps up the calculation, mischief managed.
However, bear in mind that there are limitations!
For instance, Web Workers can't modify the DOM and as a result, you may be _forced_ to find a way to perform this work on the browser's main UI thread.

## Modifying the function to use generators
Okay, let's make a modification to our `squareSum` function.
What we'll do is we'll update it to `yield` in the middle of it's calculation:
```javascript
function* squareSum(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    yield; 

    for (let j = 0; j < n; j++) {
        sum += i * j;
    }
  }

  // also yield that we're done
  yield 1;

  return sum;
}
```

Now to do a sum, we'd have to do a little bit more work:
```javascript
const gen = squareSum(20);
let result = { value: 0, done: false };
do {
  result = gen.next();
} while (!result.done);
console.log(`Sum is ${result.value}`);
```

But, we get a nice benefit here: We can _interrupt_ the calculation and resume it later.
Why is that nice? Well, now we can now set a _time budget_ on the calculation, let it run for bit, interrupt it, then resume it when we have more time to run the calculation.
This is akin to how your CPU schedules tasks: A single CPU can only do one thing at once, so it allocates time to each process, interrupts it once it reaches it's time limit, and then moves to the next process.
Switching to generators allows us to do the same thing.

## Using `requestAnimationFrame` to split the work up
Since we're running on the UI thread, we don't want our calculation to run too long.
To keep our page at 60fps, we have 16.6ms to complete our calculation.
Each frame, we can run for 16.6ms, stop the calculation and the resume on the next frame.
The easiest way to schedule work per frame is via `requestAnimationFrame`.
Here's what that would look like:
```javascript
const gen = squareSum(20000); // The number is much bigger now!
function doWork() {
  const frameStart = performance.now();
  const frameBudget = 16; // ms
  const frameEnd = frameStart + frameBudget; // when we want to stop processing

  let currentFrame = performance.now();
  let result = { value: 0, done: false };
  do {
    result = gen.next();
    currentFrame = performance.now();
  } while(currentFrame < frameEnd && !result.done);

  // if there's still more work to do, schedule another frame to do the work
  if (!result.done) {
    requestAnimationFrame(doWork);
  } else {
    console.log("DONE at " + performance.now(), result);
  }
}

requestAnimationFrame(doWork);
```

So, we create a function `doWork` which does the following:
- It figures out when it needs to stop working (to meet the 16ms budget we set).
- It starts running the generator, stopping when it either runs out of time or finishes the work.
- If we're still not done yet after the loop, it schedules another function run
- Otherwise, it logs what it did.

Doing the work this way has an interesting side effect: It makes the overall process run _slower_ since there's a lot more coordination that has to happen, but with the benefit of keeping the calculation from consuming the UI thread completely.

## Making it generic
So, how can we make this more reusable for more than just my contrived `squareSum` function?
Well, we can do a few things:
- We can make the frame budget configurable so that multiple tasks could be juggled at once
- We can make the generator itself a parameter so that any generator could be passed.
- We can also wrap all of this into a single function that "hides" the `requestAnimationFrame` call.

Taking those things into account, here's where I landed:
```javascript
function runGenerator(gen, frameBudget) {
  // return a promise that resolves once the generator finishes its calculation
  return new Promise(function(resolve) {
    function doWork() {
      const frameStart = performance.now();
      const frameBudget = 16; // ms
      const frameEnd = frameStart + frameBudget; // when we want to stop processing

      let currentFrame = performance.now();
      let result = { value: 0, done: false };
      do {
        result = gen.next();
        currentFrame = performance.now();
      } while(currentFrame < frameEnd && !result.done);

      // if there's still more work to do, schedule another frame to do the work
      if (!result.done) {
        requestAnimationFrame(doWork);
      } else {
        // we finished, return the value we calculated
        resolve(result.value);
      }
    }
    
    requestAnimationFrame(doWork);
  });
}
```

## Conclusion
So, to sum up what we did:
- We created a function that runs really slow
- We refactored it to use a generator to allow the calculation to be interrupted
- We then created a wrapper function that will budget the generator's execution across multiple render frames in the browser

This is great! We can now run an expensive piece of code without it affecting the responsiveness of the UI, at the expense of making the calculation take longer.
Generators are great for performing iteration, but hopefully the above example illustrates how they can be used for tasks beyond just that!
They're very powerful, and I hope this inspires you to use generators in new ways! Enjoy!
