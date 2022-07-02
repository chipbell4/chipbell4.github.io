---
layout: post
title: "Generating Primes In Go"
date: 2022-06-28 08:37:10
categories: go
---

## Introduction
I've lately been focusing on learning about Go performance and I've found it's a tough road.
There are very powerful tools out there, but you really have to learn the ins and outs of the tool in order to make effective use of them.
So, I had this idea: I'm going to build a few different versions of generating prime numbers (a non-trivial piece of code) and play around with the optimization of it.
In this post, I'll present how I wrote a function for calculating prime numbers, present some basic benchmarks and discuss some next steps.

## Prime Numbers
As a quick refresher, a prime number `p` is a number such that it's only divisible by itself and the number 1.
So, numbers like 5, 13, and 17 are prime, whereas 6, 14, and 16 are not and are called "composite".

Given a number `n` and `m`, we can check if `n` is divisible by `m` by checking the _modulus_, written `n mod m`.
The modulus gives us the remainder after division. So, `5 mod 2 == 1`, and `16 mod 4 == 0`.
If the modulus is 0, that means that `m` divides evenly into `n`, meaning `n` is a multiple of `m`.
Go, and most programming languages, provide some sort of operator for this. In Go, it's the `%` operator.

Given a number `n`, an easy way to check for primality is to start from 2, and go up to `n-1`, checking that the modulus is _non-zero_ for every number up to `n`.
As a recap, if `n mod m ≠ 0`, `m` doesn't divide evenly into `n`.
If this holds for all `m` from 2 to `n-1`, `n` must be prime (just by how we define the meaning of "prime").

### An Optimization
There is an interesting theorem in mathematics (so interesting that it's ["fundamental"](https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic)!)
that states that any number can be written as a product of prime numbers.

As a result, if a number `n` is prime, writing it as a product of primes doesn't change anything; it'd be written as just the single number.
If a number is composite however, `n` would be written as a product of more than one (prime) number.

We can invert this approach: If we loop over all prime numbers `p` up to `n` and check for divisibility, if we ever see a case where `n mod p == 0` we know that `n` is not prime.
Moreover, if we look at _every_ prime `p` and never see `n mod p == 0`, that means that `n` must be prime, because there's no other prime numbers in it's prime factorization, only `n`.

Here's what this pseudo-code might look like:

```
func isPrime(n, knownPrimes) {
    for p in knownPrimes up to n {
        if n mod p == 0 {
            return false
        }
    }
    return true
}
```

## Calculating the First `n` Primes
Now that we have this check, we can build a function for calculating the `n`-th prime from a list.
We start with a "seed list" of a single prime, and build it as we go:
```
func getNthPrime(n) {
    knownPrimes = {2}
    candidate = 3
    while knownPrimes.length < n {
        if isPrime(candidate, knownPrimes) {
            knownPrimes.add(candidate)
        } 

        candidate = candidate + 1
    }
    return knownPrimes[n]
}
```

## Translating To Go
Let's translate this to Go, and then we'll add a benchmark as well
```go
func isPrime(candidate int, knownPrimes []int) bool {
        for _, p := range knownPrimes {
                if candidate%p == 0 {
                        return false
                }
        }

        return true
}

func getNthPrime(n int) int {
        knownPrimes := []int{2}

        candidate := 3
        for len(knownPrimes) < n {
                if isPrime(candidate, knownPrimes) {
                        knownPrimes = append(knownPrimes, candidate)
                }

                candidate += 1
        }

        return knownPrimes[n-1]
}
```

### A Benchmark
Let's add a benchmark function for our prime calculation.
```go
func BenchmarkGetNthPrime(b *testing.B) {
        b.ReportAllocs()
        for i := 0; i < b.N; i++ {
                getNthPrime(1000)
        }   
}
```
Note that I'm also using [`ReportAllocs`](https://pkg.go.dev/testing#B.ReportAllocs) here to keep track of any memory allocations

## Initial Results
On my little development server, here's what I get:
```
BenchmarkGetNthPrime         194           6137794 ns/op           16368 B/op         10 allocs/op
```

Let's analyze this:
- The first column is the largest `N` that the benchmark got to before it was able to get accurate timing information. A slower function will have a lower number here.
- The second column tells you the average time it takes for the function to run
- The third column is how many bytes are allocated per operation. Given we're doing 1000 primes in our benchmark, we should expect 4000 bytes for 1000 32-bit integers. Where does that other memory allocation come from...
- The last column is how many allocations happen on average per call. We're finding 1000 primes, but interestingly, we don't allocate 1000 times! This is because the built-in `append` function _doubles the underlying array length_ when the capacity is exceeded. As a result, we see `log2(1000)` allocations which is about 10. The go blog has [an excellent article on the implementation](https://go.dev/blog/slices-intro).

So, how can we improve our performance?

## Optimization

### The Increment
A small optimization we can make is incrementing by 2 instead of 1.
All prime numbers (except 2) are odd, since they'd be divisible by 2.
Let's change our `candidate += 1` line to `candidate += 2`.
Here's what the benchmark gives us now:

```
BenchmarkGetNthPrime         196           6076896 ns/op           16368 B/op         10 allocs/op
```

Interestingly, this doesn't double how fast we go!

### Minimizing Allocations
Let's try to avoid those allocations instead, and only allocate just once up front.
Here's how that code would look:
```go
func getNthPrime(n int) int {
        knownPrimes := make([]int, n)
        knownPrimes[0] = 2

        candidate := 3
        primeIndex := 1

        for primeIndex < n {
                if isPrime(candidate, knownPrimes[:primeIndex]) {
                        knownPrimes[primeIndex] = candidate
                        primeIndex += 1
                }

                candidate += 2
        }

        return knownPrimes[n-1]
}
```

And here's what the benchmark gives us now:
```
BenchmarkGetNthPrime         198           6044839 ns/op            8192 B/op          1 allocs/op
```

Well, we've lowered allocations for certain but we really haven't gained much speed.

### Removing All Allocations
Can we just get rid of all the allocations? Yes!
If we make our `knownPrimes` slice an array instead it can be stack-allocated by the compiler.
This means that the memory will be allocated as part of the function in the compiled binary, rather than on the heap at runtime.
In a way, this is cheating, and you'll see why:
```go
onst MAX_PRIMES int = 10000

func getNthPrime(n int) int {
        var knownPrimes [MAX_PRIMES]int
        knownPrimes[0] = 2

        candidate := 3
        primeIndex := 1

        for primeIndex < n {
                if isPrime(candidate, knownPrimes[:primeIndex]) {
                        knownPrimes[primeIndex] = candidate
                        primeIndex += 1
                }

                candidate += 2
        }

        return knownPrimes[n-1]
}
```

To make the slice an array, the "trick" is that we have to know the size of the array at compile time.
This can present a problem because we have to know the largest `n` that would ever be passed to `getNthPrime` (which is why it's cheating a little bit).
Here's what the benchmark says:
```
BenchmarkGetNthPrime         195           6095177 ns/op               0 B/op          0 allocs/op
```

Nice! The allocations are gone. But, there's no speed-up.

# Stopping for Now
Okay, this has kind of gotten long and we still _really_ haven't gotten anywhere...
To recap, we wrote a function for getting the `n`-th prime, but we still have some more optimization (I think) that we can do.
I'll do that in a second post. Cheers!


