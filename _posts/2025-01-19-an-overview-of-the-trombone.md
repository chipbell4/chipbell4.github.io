---
layout: post
title: "An Overview of the Trombone"
date: 2025-01-19 00:20:19
categories: music math
---

<style>
table {
  width: 100%;
}

td, th {
  padding: 0.25em;
}

.c {
   background-color: #9399ff;
}
.db {
    background-color: #af079c;
}
.d {
    background-color: #00dd58;
}
.eb {
    background-color: #00addd;
}
.e {
    background-color: #7fff16;
    color: #222;
}
.f {
    background-color: #aa1d1d;
}
.gb {
    background-color: #63372e;
}
.g {
    background-color: #0ecc69;
}
.ab {
    background-color: #990465;
}
.a {
    background-color: #c90000;
}
.bb {
    background-color: #c900bf; 
}
.b {
  background-color: #00c9c9;
}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const SHARED_CONFIG = {
    type: 'scatter',
    // Missing data: [...]
    options: {
      elements: {
        point: {
          radius: 5,
        },
        line: {
          borderWidth: 5,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Position",
          },
          type: 'linear',
          position: 'bottom'
        },
        y: {
          title: {
            display: true,
            text: "Partial",
          },
        }
      }
    }
  };

</script>

## Introduction
As of about a year ago, I've picked up playing trombone again.
It's been an interesting ride: when I played back in high school I was only mildly interested in it, but after picking it up again I've really become fascinated by it.
As I've been practicing, I've realized that I still have a lot to learn.
However, I've been noodling on a lot of the math behind the instrument and I thought it'd be fun to talk through a little bit of it here.
My goal is to try and share this with whoever reads this blog (if you exist) and also try to organize my own (limited) knowledge about the instrument.
I hope you enjoy!

## Initial Physics

### Tubing Length
The trombone is basically a metal (brass) tube that amplifies and focuses the vibrations of your lips into a sound.
There's other brass instruments out there, of course, and they all work the same way.
The big ones, like tubas, have _more_ tubing and the smaller ones, like trumpets, have less tubing.
Wikipedia provides a [great derivation](https://en.wikipedia.org/wiki/Standing_wave#Standing_wave_in_a_pipe)
using partial differential equations, which I won't repeat here, but there is an elegant relationship between frequency and tube length:


$$
f = \frac{v}{2L}
$$

where $v = 331 \frac{m}{s}$, the speed of sound.

The fundamental frequency of the trombone is a Bb1
(that notation is called [scientific notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation)),
about 58.27 Hz.
From that, we can calculate the tubing length:

$$
L = \frac{v}{2f}
$$

which gives us $L = 2.84m$.
I've seen numbers closer to 2.7m online, and I'm not sure why there's a discrepancy.

### The Slide
The slide is the characteristic feature of the trombone that really sets it apart!
It essentially allows you to change the length of the instrument, altering it's fundamental.
Given our formula above, we can also estimate how long a slide is on a trombone.
We can do this by estimating how much more length we need to lower the fundamental to an E1, which is the lowest a most trombones can go without additional tubing.
E1 has a frequency $f = 41.2$, which gives us a tubing length of $L = 4.02m$, or an additional 1.18m.
Fortunately, the slide "doubles" up on the tubing, so the slide only needs to be half that length, or 590cm.

### Embouchure and Standing Waves
Whenever a player buzzes on a mouthpiece, the vibrations resonate in the trombone and produce a sound.
However, a player can also adjust their embouchure to make the instrument vibrate at various _integer fractions_ of the tube length.
Players typically refer to these as "partials", in physics they're called harmonics.
So, without moving the slide a trombone player should be able to play any integer multiple of the fundamental 58.27 Hz.
However, higher and higher partials requirement greater embouchure strength to hit.
High school players can rarely play above the 8th partial, but many professionals can play to the 16th and beyond.

### Combining It All
By combining embouchure and slide movement, trombone players can essentially select any frequency they want.
However, there's some limitations: physics presents some intonation troubles for us, and some notes aren't even playable!

## A Tuning Theory Review, or "Where Do I Put The Slide?"

### Octaves and Equal Temperment
Let's first start by defining a core musical term: "Octave".
Physically, it corresponds to the perceived pitch change from doubling a frequency.
Interestingly, for humans notes that are spaced by an octave sound "the same", or at least spaced equally apart.
I've heard this term called "octave circularity" and there's apparently some interesting [evolutionary reasoning for why this is the case](http://www.neuroscience-of-music.se/eng7.htm).

As a result, this means we hear frequency on an exponential scale.
This has interesting implications for if wanted, say, to divide the octave into "equal spaced" intervals.
It means that the difference between two adjacent pitches would not be a constant frequency, but a constant _ratio_.

Particularly, Western music divides the octave into 12 parts (for Reasons™ that I might discuss in another post).
To divide the octave into 12 equal steps, we need a ratio $H$, that when applied 12 times we get a doubling of frequency:

$$
H^{12} = 2
$$

Or

$$
H = 2^\frac{1}{12}
$$

This interval is called a "half-step" in Western music.
This method of dividing the octave is called "twelve tone equal temperment" or 12TET.

### Slide Positions
The trombone slide is free to be placed anywhere (as long as it doesn't fall off), but in general trombonist refer to seven "positions" for the slide.
1st position corresponds to the slide being all the way in, and 7th all the way out.
Moreover, going out a position, say from 2nd to 3rd, typically corresponds to lowering a single half step.
Now that we have our half step ratio, we can calculate the exact distance $d$ for the slide's position $p$.

First, the fundamental as a function of position:

$$
F(p) = \frac{58.27}{H^{p - 1}}
$$

That is, each position past 1st lowers the fundamental by a half step more (hence the division, for _lowering_ the frequency).

Recall our earlier

$$
L = \frac{v}{2f}
$$

We can now calculate the difference in length from 1st to some other position p:

$$
\Delta L(p) = \frac{v}{2F(p)} - \frac{v}{2F(1)}
$$

and, again the slide doubles on itself giving us:

$$
d(p) = \frac{\Delta L(p)}{2} = \frac{v}{4F(p)} - \frac{v}{4F(1)}
$$

Here's a table (TODO CHECK THIS):

| Position | Fundamental Pitch | Fundamental Frequency (Hz) | Slide Distance (cm) |
|----------|-------------------|----------------------------|---------------------|
| 1        | Bb1               | 58.27                      | 0                   |
|----------|-------------------|----------------------------|---------------------|
| 2        | A1                | 55                         | 84                  |
|----------|-------------------|----------------------------|---------------------|
| 3        | Ab1               | 51.91                      | 174                 |
|----------|-------------------|----------------------------|---------------------|
| 4        | G1                | 49                         | 269                 |
|----------|-------------------|----------------------------|---------------------|
| 5        | Gb1               | 46.25                      | 369                 |
|----------|-------------------|----------------------------|---------------------|
| 6        | F1                | 43.65                      | 476                 |
|----------|-------------------|----------------------------|---------------------|
| 7        | E1                | 41.20                      | 588                 |

### But Equal Temperment and Physics Don't Always Agree
There's a wrinkle in all of this though.
The harmonic series gives us integer multiples of our trombone's fundamental frequency, but that doesn't always align with equal temperment.
Consider the fifth harmonic, a D4 on a trombone, in equal temperment would be 293.66 Hz.
However, as an integer multiple of the fundamental 58.27 Hz we get 291.35 Hz.
This means that the trombone is inherently flat at this partial relative to equal temperment.

The 7th partial is even worse. It's a very out of tune Ab4.
In equal temperment, 415.30 Hz, but as an integer multiple of the fundamental 407.89 Hz.

TODO TABLE HERE

## The Art of Playing In Tune
Given these tuning quirks that physics gives us, trombonists typically learn to adjust pitch on the fly with the slide (and embouchure) to keep things in tune.
For instance, that 7th partial is still usable, but not for an Ab4.
Instead, trombonists will use it especially for G4 and Gb4 (and sometimes even F4, but we'll get to that one in a moment).

### Partial and Slide Position Overlaps
As we get higher up on the harmonic series an interesting phenomenon occurs:
we gain the ability to play some pitches in multiple ways.
For example, most trombonists learn early that F3 can be played in both 1st position (on the 3rd partial) and 6th (on the 4th partial).
However, many pitches have multiple possible ways to play them, as many as 4 in some cases.

Here's the table of options available to you:
<table>
  <thead>
    <tr>
      <th></th>
      <th>1st</th>
      <th>2nd</th>
      <th>3rd</th>
      <th>4th</th>
      <th>5th</th>
      <th>6th</th>
      <th>7th</th>
    </tr>
  </thead>
  <tr>
    <th>8</th>
    <td class="bb">Bb4</td>
    <td class="a">A4</td>
    <td class="ab">Ab4</td>
    <td class="g">G4</td>
    <td class="gb">Gb4</td>
    <td class="f">F4</td>
    <td class="e">E4</td>
  </tr>
  <tr>
    <th>7</th>
    <td class="ab">Ab4</td>
    <td class="g">G4</td>
    <td class="gb">Gb4</td>
    <td class="f">F4</td>
    <td class="e">E4</td>
    <td class="eb">Eb4</td>
    <td class="d">D4</td>
  </tr>
  <tr>
    <th>6</th>
    <td class="f">F4</td>
    <td class="e">E4</td>
    <td class="eb">Eb4</td>
    <td class="d">D4</td>
    <td class="db">Db4</td>
    <td class="c">C4</td>
    <td class="b">B3</td>
  </tr>
  <tr>
    <th>5</th>
    <td class="d">D4</td>
    <td class="db">Db4</td>
    <td class="c">C4</td>
    <td class="b">B3</td>
    <td class="bb">Bb3</td>
    <td class="a">A3</td>
    <td class="ab">Ab3</td>
  </tr>
  <tr>
    <th>4</th>
    <td class="bb">Bb3</td>
    <td class="a">A3</td>
    <td class="ab">Ab3</td>
    <td class="g">G3</td>
    <td class="gb">Gb3</td>
    <td class="f">F3</td>
    <td class="e">E3</td>
  </tr>
  <tr>
    <th>3</th>
    <td class="f">F3</td>
    <td class="e">E3</td>
    <td class="eb">Eb3</td>
    <td class="d">D3</td>
    <td class="db">Db3</td>
    <td class="c">C3</td>
    <td class="b">B2</td>
  </tr>
  <tr>
    <th>2</th>
    <td class="bb">Bb2</td>
    <td class="a">A2</td>
    <td class="ab">Ab2</td>
    <td class="g">G2</td>
    <td class="gb">Gb2</td>
    <td class="f">F2</td>
    <td class="e">E2</td>
  </tr>
  <tr>
    <th>1</th>
    <td class="bb">Bb1</td>
    <td class="a">A1</td>
    <td class="ab">Ab1</td>
    <td class="g">G1</td>
    <td class="gb">Gb1</td>
    <td class="f">F1</td>
    <td class="e">E1</td>
  </tr>
</table>

Some things to note:
- Sorry about the colors! I have synethesia and these are the colors I see for those pitches...
- A few pitches are missing from the chart! Eb2 down to B1 aren't there, and that's no mistake.
  Because of the way the trombone works, there's a gap in it's range there.
  The slide just isn't long enough.
  However, you'll see many trombones (most professional symphonic models) also have an "F attachment".
  This is essentially a valve that lowers the fundamental frequency of the trombone down to F1 which will make those missing pitches available.
  Also note that many trombonists can use their embouchure to reach those notes without the help of an attachment.
  These are called "false tones" and are typically inferior in tone quality.

### Routing Passages
The slide while providing the ability to adjust intonation at will also requires greater physical movement than a valve.
This can really present a problem with fast passages.
Pitch sequences that require a lot of travel between notes become cumbersome.
For example, a passage that rapidly alternates between F3 and C3 results in movement between 1st and 6th position, which is awkward.
Composers should avoid (but don't always) that sort of movement.

Alternate positions can potentially help considerably.
For that above example, playing the F3 in 6th position would make the passage far easier,requiring slide movement only for small tuning adjustments.
In the higher range, more options become available.

This is something I've reflected on recently: how can I better understand and internalize those options for me as a trombonist?
I propose the following graph, where the x-axis is the position, and the y-axis is the partial.
From there, we can graph a line plotting the course of the slide while playing a passage.
Consider the following example for playing the Bb major scale from Bb3 to Bb4:
<canvas id="bb-major-normal"></canvas>
<script>
const positions = [
    {x: 1, y: 4},
    {x: 2.8631371386483475, y: 5},
    {x: 0.863137138648348, y: 5},
    {x: 3.0195500086538747, y: 6},
    {x: 1.019550008653874, y: 6},
    {x: 1.6882590646912492, y: 7},
    {x: 1.9999999999999947, y: 8},
    {x: 1, y: 8},
];

let canvas = document.getElementById("bb-major-normal")
new Chart(canvas, {
  ...SHARED_CONFIG,
  data: {
    datasets: [{
      label: "Bb Major Scale",
      data: positions,
      showLine: true,
      backgroundColor: "red",
      tooltip: {
        callbacks: {
          label: (ttItem) => {
            const labels = ["Bb3", "C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"];
            return labels[ttItem.dataIndex];
          }
        }
      }
    }]
  }
});
</script>

This is mostly how I and other people I've seen play this scale.
I used a script to generate this, and it's worth pointing out a few things:
- D4 is in _past 1st position_, because it's a little flat. The script was trying to fix that for me.
- The sixth partial notes, F4 and Eb4 are "out" a little.
- However, C4 is further in (even though it's also in 3rd position like Eb4).
- The G is practically _in-between_ positions.

Now, let's look at a different path one could take
<canvas id="bb-major-different"></canvas>
<script>
const newPositions = [{x: 1, y: 4}, {x: 2.8631371386483475, y: 5}, {x: 4.019550008653872, y: 6}, {x: 5.688259064691246, y: 7}, {x: 5.999999999999993, y: 8}, {x: 3.999999999999996, y: 8}, {x: 1.9999999999999947, y: 8}, {x: 1, y: 8}]
let newCanvas = document.getElementById("bb-major-different")
new Chart(newCanvas, {
  ...SHARED_CONFIG,
  data: {
    datasets: [{
      label: "Bb Major Scale",
      data: newPositions,
      showLine: true,
      backgroundColor: "red",
      tooltip: {
        callbacks: {
          label: (ttItem) => {
            const labels = ["Bb3", "C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"];
            return labels[ttItem.dataIndex];
          }
        }
      }
    }]
  }
});
</script>

This certainly looks different...
- There's no zig-zags: the slide moves in one direction for a while and then back. This arguably would let you play faster
- I've never played this scale like this. Ever. It seems like a good idea, but why haven't I?

This has got me thinking about why that first way may _actually be better in practice_, and here's a few thoughts I have:
- People learn the first pattern earlier so the muscle memory is more "solidified".
  It's easier to play that pattern because you don't have to think as hard about it
- Tuning is easier in closer positions, like 2nd and 3rd.
  This is probably due to how your arm works.
  As a result, that second pattern ends up being harder to tune with lots of far-out positions
- The 7th partial is a little more difficult to tune. So, when one _does_ play on that partial they stick to notes they play a lot on that partial.
  So, that G4 in 2nd is more likely to be in tune while playing than the Eb4 in 6th because we rarely play Eb4 in 6th.
