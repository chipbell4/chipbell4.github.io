---
layout: post
title: "Animating A Blob"
date: 2025-12-11 20:33:59
categories: math game-dev javascript
include_scripts: [
    "/assets/blob/blob2.js"
]
---

<style>
    canvas {
        width: 200px;
        height: 200px;
        margin-left: auto;
        margin-right: auto;
        background: white;
        border-radius: 3px;
    }
</style>

## Introduction
In my [previous post]({% post_url 2025-11-30-make-a-blob %}) I played around with a couple of ways to build a convincing "blob" with JavaScript.
In this follow up post, I'll show off a cool way to animate it.
We'll lean into some more Fourier stuff, and end up (I think) with a really cool effect.

## Quick Recap
If you haven't read the previous article, I highly recommend it because we're going to build off of the math from it.
But to review, we came up with a nice "blob function" that defines the blob's radius as a function of angle:

$$
B(\theta) = a_0 + \sum{ a_k \sin{ ( k\theta + b_k ) }}
$$

Note that $k$ only goes up to some fixed $n$ that's not "too big" which keeps the blob from getting too "pointy". In the previous post $n = 10$.

In the previous post we also worked out some limits on what $a_k$ could be, and used that to calculate what a minimum value for $a_0$ would be.

## Where We're Going Next
In the previous post we basically just set $b_k$ randomly.
Our "blob constraints" didn't really tell us what $b_k$ needed to be so we just picked something.
So could we pick something else?

Well, it might be better to first demonstrate what $b_k$ does.
Consider the following blob with just a single $\sin$ term, and $b_1 = 0$ ($n = 1$):

$$
B(\theta) = 75 + 50 \sin{ \theta + 0}
$$

<canvas id="single-sine-no-shift" width="200" height="200"></canvas>

Now consider what happens when we change $b_1$ to be 15º, i.e. $b_1 = \frac{pi}{12}$.

<canvas id="single-sine-with-shift" width="200" height="200"></canvas>

So, changing $b_k$ _shifts_ the sine term, which results in the blob rotating.
What if we animated that $b_1$ term?

<canvas id="animated-single-sine" width="200" height="200"></canvas>

Okay, that's what we're looking for.
Let's come up with a generalized approach.

## How Do We Animate That
Let's make $b_k$ a function of time:

$$
b_k(t) = f_k t + \beta_k
$$

where $f_k$ is the how fast $b_k$ changes and $\beta_k$ is the initial value of $b_k$.

### Picking Values
Picking random values is straightforward: For $\beta_k$ we need a uniform random number between 0 and $2\pi$, that is $b_k$ starts as offset anywhere on the circle.

For $f_k$ we pick such that our sine shift doesn't happen "too fast".
We can measure "too fast" by saying that $b_k$ loops back on itself every $T$ seconds or greater.
The longer it takes, the slower its moving.
We can formulate that like this (assuming $f_k$ non-negative):

$$
b_k(t + T) - 2 \pi \le b_k(t)
$$

Fleshing this out gives:

$$
f_k (t + T) - 2 \pi + \beta_k \le f_k t + \beta_k
$$

Then we simplify:

$$
f_k T - 2 \pi \le 0
$$

Lastly, we solve for $f_k$:

$$
f_k \le \frac{2 \pi}{T}
$$

Similarly, for $f_k \le 0$ we get a similar result, and can simplify to:

$$
-\frac{2 \pi}{T} \le f_k \le \frac{2 \pi}{T}
$$

### How Does That Look?
Here's some code for generating (and drawing) blobs.
Hopefully it's a little more organized, but I'm now using the criteria we just determined for finding $f_k$.

```javascript
class AnimatedBlob {
    constructor(r, n) {
        this.a = [];
        this.f = [];
        this.beta = [];

        const H_n = 2.92897; // 10th harmonic number. TODO: Calculate this based off n
        const epsilon = r * n / H_n;
        const delta = 1.0
        this.a0 = epsilon / n * H_n + delta;

        const T = 1.0; // max period for a blob to circle around

        for (let k = 0; k < n; k++) {
            // set a
            const top = epsilon / (k + 1) / n;
            const bottom = -top;
            this.a.push(bottom + Math.random() * (top - bottom));

            // set f
            this.f.push(this.rand(-Math.PI * 2 / T, Math.PI * 2 / T));

            // set beta, uniform random between 0 and 2pi
            this.beta.push(this.rand(0, Math.PI * 2));
        }
    }

    rand(min, max) {
        return min + Math.random() * (max - min);
    }

    radius(theta, t) {
        // theta is in radians
        let radius = this.a0;
        for (let k = 0; k < this.a.length; k++) {
            radius += this.a[k] * Math.sin((k + 1) * theta + this.f[k] * t + this.beta[k]);
        }
        return radius;
    }

    draw(ctx, t) {
        const radii = [];
        for (let degrees = 0; degrees < 360; degrees++) {
            radii.push(this.radius(degrees * Math.PI / 180, t));
        }

        drawBlob(ctx, 100, 100, radii);
    }
}

const finalCtx = document.getElementById("final-result").getContext("2d");
const blob = new AnimatedBlob(75, 10);
let t = 0;
function drawAnimated() {
    blob.draw(finalCtx, t);
    t += 1 / 16;
    requestAnimationFrame(drawAnimated);
}
```


<canvas id="animated" width="200" height="200"></canvas>
<button id="regenerate">Make another</button>

### A Better Criteria for $f_k$
If you regenerate a few blobs you'll find that some almost feel "jittery".
I noodled on that a bit, and I think what's happening is we're getting a case where the following occurs:
- $k$ is on the "larger" side, so the $\sin$ term is higher frequency
- the random value for $f_k$ happens to be larger magnitude.

In this scenario, the $b_k$ term shifts quickly from 0 to $2\pi$, a full sweep over the period of the $\sin$ term.
However, the $\sin$ term is actually $\sin{k \theta}$ so a sweep from 0 to $2\pi$ covers $k$ periods of the term.
We can correct for this by making $b_k$ loop back on itself _over the period of the $\sin$ term_.
That would look like this:

$$
b_k(t + T) - \frac{2 \pi}{k} \le b_k(t)
$$

Going through the algebra again, we get the following criteria for $f_k$:

$$
-\frac{2 \pi}{kT} \le f_k \le \frac{2 \pi}{kT}
$$

Here's what that looks like

<canvas id="animated2" width="200" height="200"></canvas>
<button id="regenerate2">Make another</button>

## Conclusion
Well these are pretty cool, I guess?
For funsies I put them up on [my business website](https://www.minervadigital.net) if you're interested in seeing them in the wild!