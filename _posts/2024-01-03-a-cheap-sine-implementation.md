---
layout: post
title: "A Cheap Sine Implementation"
date: 2024-01-03 11:15:22
categories: go math
---

## Introduction
I recently took a shot at implementing a custom sine function in go, to compare it's performance against the built-in sine implementation. It trades accuracy for speed.


# How Did I Implement It? 
One interesting result of introductory Calculus is [Taylor's Theorem](https://en.wikipedia.org/wiki/Taylor%27s_theorem) which allows you to approximate a differentiable function (like $sin(x)$) with a polynomial, called a Taylor polynomial. If the function is $k$-times differentiable, you can approximate the function with up to a $k$-degree polynomial.

In particular, if we calculate the Taylor polynomial centered around $x=0$, we get what's referred to as a [Maclaurin series expansion](https://mathworld.wolfram.com/MaclaurinSeries.html)
which looks like this for $sin(x)$:

$$
sin(x) \approx x - \frac{1}{6}x^3 + \frac{1}{120}x^5 - \frac{1}{5040}x^7 + ...
$$

In [my implementation](https://github.com/chipbell4/sine-approximation/blob/main/sine.go#L10), I take the first 3 terms and use that as an approximation for $sin(x)$. As a result, we end up with an implementation that only uses a few multiplication, division, and addition operations.

## How Fast
On my Apple M1, here's my benchmark results:
```
goos: darwin
goarch: arm64
pkg: chipbell4.github.com/m/v2
BenchmarkOriginalSine-8         255438804                4.412 ns/op
BenchmarkFastSine-8             1000000000               0.3128 ns/op
PASS
ok      chipbell4.github.com/m/v2       2.132s
```

So, this looks like a ~14x speed-up.

## How Off Are We?
The entrypoint `main.go` prints a table of relative errors. At π / 2, we end up with an error of ~0.45%.
Here's a few selected values:

| Angle (radians) | Relative Error |
|-------|---------------|
| 0 | 0 |
| π / 8 | 0.000075% |
| π / 4 | 0.005129% |
| 3π / 8 | 0.066355% |
| π / 2 | 0.45% |

We never get above 1% error.


## How Does math.Sin Even Work Anyways? Are we better off?
The original source is here, https://cs.opensource.google/go/go/+/refs/tags/go1.21.5:src/math/sin.go

But if you do some reading, they're doing a few things worth noting:
- They're using the same approximation I'm using: Taylor series expansion around $x=0$.
- However, they're doing some work to handle the modular nature of trigonometric functions, which I am not.
- They also will call a system-specific sine function if it's available.

### Then Why are We That Much Faster?
When I compile my `OriginalSine` function using Godbolt, the following bit of assembly seems to be the culprit:
```assembly
CALL    math.sin(SB)
```

It looks like the code is making a call to an external sine (probably system-specific) implementation. I imagine that overhead is the majority of runtime cost. I suspect there's some compile flags to inline that function that would minimize or eliminate some of that overhead.

## So What?
Well, this may be helpful in a game development setting where minor optimizations can sometimes add up to improved framerate (like the [fast inverse square root algorithm from Quake III](https://en.wikipedia.org/wiki/Fast_inverse_square_root)). But there's some caveats:

- This implementation doesn't currently handle the modular nature of sine. We'd have to add some code to support that.
- The accuracy is lower, which may not be acceptable for certain applications.

Either way, it was pretty fun to build! The final code is [here](https://github.com/chipbell4/sine-approximation/blob/main/sine.go#L10) if you're interested.
