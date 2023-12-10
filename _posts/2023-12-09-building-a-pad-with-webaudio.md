---
layout: post
title: "Building a pad with WebAudio"
date: 2023-12-09 21:21:00
categories:
---

## Introduction
I recently built a synth pad in WebAudio for the [Mondrian chord visualizer](/assets/mondrian/index.html) I built.
There a few interesting bits I had to figure out along the way, so I wanted to share them here.

## Some Pointers for Custom Audio Components
One approach I've been taking recently with WebAudio is to create my own custom classes that behave like built-in WebAudio components.
In general, that means these things:
- The constructor takes the `AudioContext` as the first parameter. This mimicks the behavior of most other built-in components in for WebAudio.
- There's a `connect()` method that allows you to connect it down the chain to something else (like reverb or gain).
- Any reasonable `AudioParam`s are exposed as setters for more intuitive access, just like WebAudio built-ins do.

As we begin building this out, I'll be trying to adhere to those above principles.

## Overall Approach
First of all, what's a pad?
[This article](https://lunacy.audio/synth-pad/) has a nice description.
In short, I'd describe a synth pad as a rich, sustained, synthesizer sound that's used to "fill space": it has a slow attack, and lots of harmonics that cover a wide audio spectrum.
There's quite a few good tutorials on building pads and some of the various tips I read were helpful for WebAudio.

Here were some main take-aways from my research:
- Shape the sound with an [ADSR envelope](https://en.wikipedia.org/wiki/Synthesizer#Envelopes): The note should take some time to reach full volume.
- Use multiple oscillators and detune them. This gives a fuller sound.
- [LFOs](https://en.wikipedia.org/wiki/Low-frequency_oscillation) can also create some depth

To make this happen I ended up with three classes:
- A `Voice` class that represents a single "note" on the pad. It consists of multiple detuned oscillators all working together to generate a single key pressed on the keyboard.
- An `Lfo` class. An Lfo is a "low-frequency oscillator". We hook this up to a low-pass filter on pad's output which allows the pad's sound to slowly change over time. It adds a little character and helps the pad sound "alive" and not so flat/dull.
- The `Pad` class. A pad has a set of `Voices`, which feed into a final gain node for volume control. The output of that is fed into a `BiquadFilterNode` which is controlled by a custom `Lfo` I built. That's then fed to the main output (`AudioContext.destination`, i.e. the speakers). The main gain node here is used as an ADSR envelope and ramps the sound up slowly rather than immediately.

Here's a breakdown of each.

## Building an LFO
This one is the easiest, so let's talk about that one first.
In short, a low-frequency oscillator is an oscillator that oscillates at very low frequencies (think on the order of 1Hz, etc.).
Those sorts of frequencies aren't audible to humans, but that can be used to control other things and end up being used as a fundamental building block for synths in general.

Here's how I implemented it:
```javascript
class Lfo {
  constructor(context) {
    this.context = context;
    
    this.oscillator = new OscillatorNode(context, {
      frequency: 1,
      type: "sine",
    });
    this.oscillator.start(0);
    
    this.gainNode = new GainNode(context, {
      gain: 500,
    });
    
    this.oscillator.connect(this.gainNode);
  }
  
  get frequency() {
    return this.oscillator.frequency;
  }
  
  get gain() {
    return this.gainNode.gain;
  }
  
  connect(output) {
    this.gainNode.connect(output);
  }
}
```

In short, we create an oscillator, and connect it to a gain node.
The oscillator is self-explanatory, but the gain node serves to amplify the oscillator's output so that it can range beyond -1 to 1.
In this case, the default is that Lfo's amplitude ranges from -500 to 500.
I also exposed frequency and gain as properties which will make the class easier to work with.
Lastly, I created a `connect` method so that we can easily hook it into other `WebAudio` components.

## Synthesizing a single "Voice"
To synthesize a single note for the synth, I created a `Voice` class.
The class creates a set of oscillators and feeds them all into a single gain which serves as the output for the component.

One way to make the voice sound richer and fuller is to slightly detune each oscillator from each other.
This causes each oscillator's wave form to not line up perfectly with each other, causing [contructive and destructive interference](https://en.wikipedia.org/wiki/Beat_(acoustics)).

If we have \(n\) oscillators, and want to spread their tuning over \(d\) half-steps (our "detune" parameter) around some target frequency \(f\), we have the following:

The \(k\)-th oscillator is tuned the following number of half-steps away from \(f\):

$$
h = 2d\left(\frac{k}{n} - \frac{1}{2}\right)
$$

If a half-step has the tuning ratio of $\sqrt[12]{2}$ that means that $k$-th oscillators frequency will be:
$$
f_k = f \left(\sqrt[12]{2}\right)^h = 2^{\frac{h}{12}} f
$$

I wrote this as a setter for the `Voice` class and it ended up looking like this:

```javascript
class Voice {
    // ... snip
    set frequency(f) {
        const n = this.oscillators.length;
        for (let i = 0; i < n; i++) {
            const halfSteps = 2 * this.detune * ((i / n) - 0.5) / n;
            const frequency = f * Math.pow(2, halfSteps / 12);
            this.oscillators[i].frequency.value = frequency;
    }
  }
    // ... snip
}
```

## The Pad Class
Lastly, the pad class creates a bunch of `Voice` instances and joins those into a single gain.
Then, it hooks that to a `BiquadFilterNode` which is controlled an `Lfo`.
This gives the pad a bit of a "sweep" effect.
Most of the action happens in the constructor:

```javascript
class Pad {
  constructor(context, config) {
    this.voices = [];
    this.gainNode = new GainNode(context, {
      gain: 0,
    });
    const VOICE_COUNT = 4; // could be configurable
    for (let i = 0; i < VOICE_COUNT; i++) {
      const voice = new Voice(context, config);
      this.voices.push(voice);
      voice.connect(this.gainNode);
      voice.gain.value = 0.2;
    }
    
    this.lfo = new Lfo(context);
    this.lfo.frequency.value = 0.1;
    this.lfo.gain.value = 300;
    
    this.filter = new BiquadFilterNode(context, {
      type: "lowpass",
      frequency: 600,
      gain: 1,
    });
    this.lfo.connect(this.filter.frequency)
    
    this.gainNode.connect(this.filter);
  }

  // ... snip
}
```

Then, to play a chord we take an array of frequencies and set each voice to one of the frequencies in the chord.

## Final Result
I've put the final result on codepen with some example chords as well. Enjoy!

<p class="codepen" data-height="300" data-default-tab="js,result" data-slug-hash="qBgvMxZ" data-user="chipbell4" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/chipbell4/pen/qBgvMxZ">
  Synth Pad Demo</a> by Chip Bell (<a href="https://codepen.io/chipbell4">@chipbell4</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
