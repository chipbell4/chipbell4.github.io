---
layout: post
title: "Make a Blob"
date: 2025-11-30 12:24:22
categories: math game-dev
include_scripts: [
    "/assets/blob/blob.js"
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
This post documents the process behind a little code-art project I've been recently working on:
Making animated "blobs". Here's what one looks like:

<canvas id="final-result" width="200" height="200"></canvas>


## Initial Drawing Code
The first thing we need to do is build our code for drawing a blob.
Our initial blob is going to be very boring: a circle, i.e. a blob with no "blobbiness".
We'll model that as a series of "radii" (the plural of radius!) from a center point
and draw it with the canvas 2D context API.
For the purposes of this article, all of the canvases are 200 x 200,
and our blobs/circles are centered at (100, 100).

```javascript
// We'll reuse this everywhere
function drawBlob(ctx, cx, cy, radii) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2d3a5dff';
    ctx.moveTo(cx + radii[0], cy);
    for (let i = 0; i < radii.length; i++) {
        const rad = i / 180 * Math.PI;
        const x = cx + radii[i] * Math.cos(rad);
        const y = cy + radii[i] * Math.sin(rad);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(cx + radii[0], cy); // close the circle
    ctx.stroke();
}

const ctx = document.querySelector('#canvas').getContext('2d');

// For now, each radius is the the same, which will give us a circle
const blob = [];
const RADIUS = 50;
for (let i = 0; i < 360; i++) {
    blob.push(RADIUS);
}

drawBlob(ctx, 100, 100, blob);
```

<canvas id="initial" width="200" height="200"></canvas>

## Some Math to it "Blobby"
### An Initial, Not Great Approach
One approach you might take is to set the radius randomly.
In the above example, I set it to a constant 50px, but what if we did a random range?
Say, 40 to 60? Like this:

```javascript
const ctx = document.querySelector('canvas').getContext('2d');

// For now, each radius is the the same, which will give us a circle
const blob = [];
for (let i = 0; i < 360; i++) {
    const radius = 40 + Math.random() * 20;
    blob.push(radius);
}

drawBlob(ctx, 100, 100, blob);
```
<canvas id="random" width="200" height="200"></canvas>

I mean, that's kinda cool, but it's not really a blob.
We need something to create smooth edges but retaining that randomness.

### Basic "Requirements" for a Blob
Stepping, let's define what I'm thinking makes a "good" blob.
There's a few things:
- The blob needs to remain "continuous" everywhere. When we go around the circle, we want the edges to be pretty close. If they're far it'll feel "discontinuous"
- The blob needs to be "smooth". From one place to the next it can't change too much too fast or it won't look "blob-like" but rather chaotic like that last example.

Let's notate this out. First of all, our blob is a function $B(\theta)$ ($\theta$ being the angle) with properties, as outlined above:
* It's continuous across the whole circle $ 0 \le \theta \le 2 \pi $ and, importantly, $B(0) = B(2\pi)$
* It's smooth, in that the derivative doesn't get "too big". We can just write this as $-\epsilon \le B^{\prime}(\theta) \le \epsilon $, where $\epsilon$ is some tolerance we can set.

Another thing we'll also want to ensure is that the blob doesn't go "inside out". $B(\theta) \gt 0$ should do the trick.

This may or may not be obvious, but our boring circle fits the bill perfectly: $B(\theta) = R$ for some radius $R$. In this case,
* $B(0) = B(2\pi) = R$.
* $B^{\prime} = 0 \lt \epsilon$ and
* $B(\theta) = R \gt 0$
so this is "trivially" a good blob.

However, if we lean into that first condition: $B(0) = B(2pi)$ we can define a class of functions that meet our needs.

### A Brief Foray into Fourier
Our first condition is essentially requiring that $B$ be periodic with period $2\pi$.
Both $\cos(\theta)$ and $\sin(\theta)$ both would work, and even better
$\cos(k\theta)$ and $\sin(k\theta)$ will work for any integer $k$.
We can extend this even further by noticing that $\cos(k\theta + c)$ and $\sin(k\theta + c)$ is $2\pi$-periodic for any integer $k$ and real number $c$.

For simplicities sake, and noticing that $\cos(k\theta + \frac{\pi}{2}) = \sin(k\theta)$, we can ignore working with cosines for a second and now write $B$ like this:

$$
B(\theta) = a_0 + \sum{ a_k \sin{ ( k\theta + b_k ) }}
$$

I don't think is _specifically_ a discrete Fourier series, but it's pretty close.
What's nice about this is that we're setup for a few nice things
* We've guaranteed that $B(0) = B(2\pi)$ just because of how the sine function works
* We've also set ourselves up to randomly generate $a_k$ and $b_k$, but...

We've still got to adhere to our other "blob rules". Let's see if we can figure out that out.
Also note, for reasons that will become apparently later, this summation will need to be finite with $n$ terms (you can pick your favorite positive integer if you like!)

### Derivative Constraints
Recall our earlier constraint: $-\epsilon < B^{\prime} < \epsilon$.
Let's calculate the derivative and see what we get:

$$
B^{\prime} = \sum{ ka_k \cos{ ( k\theta + b_k )}}
$$

Some things to note about what we've got now:
* The cosine function ranges between $-1$ and $1$
* The $b_k$ will probably cause the individual cosine functions to not attain their maximum at the same value of $\theta$, but worst case they could.

So, for the purposes of constraining this whole thing we can replace those cosine terms with just $1$.

$$
-\epsilon \le \sum{ ka_k } \le \epsilon
$$

Interestingly, the "later" terms influence the sum more, and must be therefore be smaller.
One particular choice might be the harmonic series (with $n$ terms): $a_k = \frac{\epsilon}{kn}$ which just barely fits:

$$
\sum{ka_k} = \sum{k \frac{\epsilon}{kn} } = \sum{ \frac{\epsilon}{n} } = \epsilon
$$

If we're randomizing, we just need to pick $a_k$ randomly between $\pm \frac{\epsilon}{kn}$

### Postivity Constraints
The blob must also keep a good outlook on things. No, I'm kidding. Well, a positive outlook does help.

What I really mean is that $B \gt 0$ for any value of $\theta$. That results in something like:

$$
a_0 + \sum{ a_k \sin{ ( k\theta + b_k ) }} \gt 0
$$

Assuming $a_0$ is positive, and the "worst" case value for sine is $-1$, we end up with this constraint:

$$
a_0 \gt \sum{ a_k }
$$

Recalling our earlier closed form of $a_k = \frac{\epsilon}{kn}$ we get:

$$
a_0 \gt \frac{\epsilon}{n} \sum{ \frac{1}{k} }
$$

Interestingly, that summation term is the $n$-th harmonic number $H_n$. To feel smug, I'll simplify:

$$
a_0 \gt \frac{\epsilon}{n} H_n
$$

Note that we get to pick $\epsilon$ and $n$.
Also note that if $n$ was infinite, the summation wouldn't converge and we wouldn't be able to pick a value for $a_0$ that meets our constraints.

## Okay So Does That Look Good Now?
Well, let's see.
Below is a version that allows you to set $\epsilon$ and see what it does.
I'm hard-coding $n$ to 10.
I'm randomly picking $a_k$ between $\pm \frac{\epsilon}{kn}$,
and $a_0 = \frac{\epsilon}{n} H_n + \delta$ where $\delta$ is just some fudge I added to help it look better.
<canvas id="live-demo" width="200" height="200"></canvas>
<input type="range" id="live-epsilon" min="0" max="100" step="0.1" />

## Okay, Can It Look... Not Like That?
Well, one thing you notice quickly is that as $\epsilon$ increases, the radius does too.
That sort of makes since, because the way in which we calculate $a_0$ is directly proportional to $\epsilon$.
This actually gives us some nice guidance on how to choose $\epsilon$.
Essentially, we want to choose $\epsilon$ such that $\frac{\epsilon}{n} H_n$ approximates the average radius we want to have.

Here's why: When we set $a_k$ randomly, we're setting it using a uniform distribution, centered at 0.
This means that, on average, $a_0$ is the dominating factor in how big the blob is.

So, if we want our blob to have an average radius of $r$, we can set $\epsilon$ as follows:

$$
\epsilon = \frac{rn}{H_n}
$$

Here's what that looks like with $r$ set to 75.
<canvas id="blob-with-radius" width="200" height="200"></canvas>
<button id="make-another">Make Another</button>

## Or, You Could Just Do This
Okay, that was a lot of math and work...
What if we just... what if we just generated random data and then smoothed it.
This is arguable easier and faster, but we just need to figure out how to smooth it.

A low-pass filter is the tool we need, as it essentially removes those high frequencies we were careful to remove by using a not-too-large $n$ value.
A very quick way to perform this smoothing is with a "boxcar filter".
In a boxcar filter, you essentially replace a value with the average the value with it's neighbors.

So, if $B_i$ is one of our random points in the blob ( $ 0 \le i \lt 360 $ ),
we can perform a boxcar filter $F_w$ with width $w$ and get a new a sequence:

$$
F_w(B)_i = \frac{1}{2w + 1} \sum_{i - w}^{i + w} B_i
$$

That formula above is saying what I said above: the $i$-th filtered value is the average of the $w$ values to the left and right of it (a total of $2w - 1$ values).

So our algorithm would work like this:
* Generate some random radii in the range $r \pm \delta$
* Run a boxcar filter of width $w$ on it
* Profit?

Here's what that looks like with some knobs as well:

<canvas id="boxcar-blob" width="200" height="200"></canvas>
<label for="live-delta">Delta Value:</label>
<input type="range" id="live-delta" min="0" max="75" step="1" />
<br/>
<label for="live-w">W Value:</label>
<input type="range" id="live-w" min="0" max="100" step="1" />

You can see that this approach sort of works, but a lot of the jaggedness is still preserved.
Boxcar filters are in a sense an imperfect approach to what we're doing by randomly building a Fourier series by hand.

## Conclusion
I think this is a good place to wrap up.
The Fourier-based approach ended up giving me a closer approximation of what I had in mind,
but was a little heavy on the math.
The nice thing about this approach is that it gives us some pretty precise control over how the blob looks.
Building our blob this way will also open us up for some cool animation, which I'll cover in a later write-up.
Cheers!