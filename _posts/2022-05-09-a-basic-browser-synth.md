---
layout: post
title: "A Basic Browser Synth using Web Audio"
date: 2022-05-09 08:03:35
categories: javascript webaudio
---

## Overview
I've started planning out posts for this blog, and I realize that I'm going to need a nice way to generate sounds programmatically.
WebAudio, probably my favorite browser API, provides some nice audio synthesis capabilities which we'll use in this post to build a small monophonic synthesizer.

## WebAudio Intro
WebAudio is a browser API that gives you lower-level access to audio in the browser.
With WebAudio, you can do things like decode an audio file into a buffer, manipulate the buffer, wire it up to various effects, and then pipe it out to the user's speakers.
Moreover, you also have access to some core audio primitives that allow you to generate your _own_ sound without loading an external file.

[Sound is essentially wiggly air](https://youtu.be/cdasn27lbgY?t=14).
That is, what we perceive as sound is vibrations in the air.
In particular, our ears can typically hear vibrations for a range of frequencies, typically 20Hz up to 20KHz, although that top limit gets lower as we get older.
As a result, a very core audio primitive for "creating sound" is an _oscillator_.
An oscillator produces a repeated vibration in an audible frequency range.
Most oscillators are configurable in that their frequency and the shape of the waveform they produce can be set.

In the WebAudio world, audio components are modeled as "nodes" and can be connected to each other.
In our case, we'll create an oscillator which will generate a tone.
We'll feed that into a `GainNode` which will allow us to control the volume of the signal.
We'll that connect the `GainNode` to the main "destination", which is essentially the user's speakers.
Our graph will look something like this:

<svg width="300" height="350" viewBox="0 0 300 350">
    <defs>
        <marker id="arrow-head" markerWidth="13" markerHeight="13" refx="2" refy="6" orient="auto">
            <path d="M2,2 L2,11 L10,6 L2,2"/>
        </marker>
    </defs>
    <style>
      text {
        text-align: center;
        background: blue;
      }
      rect {
        fill: #eee;
        stroke: #333;
      }
      path.arrow {
        stroke: #933;
        stroke-width: 2;
        fill: none;
        marker-end: url(#arrow-head);
      }
      #arrow-head path {
        fill: #933;
      }
    </style>

    <rect x="50" y="50" width="200" height="40" rx="4"/>
    <text x="50%" y="75" text-anchor="middle">OscillatorNode</text>
    <path class="arrow" d="M150,95 L150,130" />

    <rect x="50" y="150" width="200" height="40" rx="4"/>
    <text x="50%" y="175" text-anchor="middle">GainNode</text>
    <path class="arrow" d="M150,195 L150,230" />
    
    <rect x="50" y="250" width="200" height="40" rx="4"/>
    <text x="50%" y="275" text-anchor="middle">Destination</text>

</svg>


## Getting Some Sound Playing
Let's first start by creating some bare-bones audio node configuration to get some sound playing.
We'll use two nodes: an oscillator, which will produce our tone, and a gain node, which will give us the ability to control volume.
Here's what that would look like:
```javascript
const context = new AudioContext();

// Create an oscillator and set its frequency and waveform
const osc = context.createOscillator();
osc.frequency.setValueAtTime(220, context.currentTime);
osc.type = 'square';

// create a gain node for controlling volume
const gain = context.createGain();
gain.gain.setValueAtTime(0.1, context.currentTime);

// connect the oscillator to the gain node, and then the gain node to the speakers
osc.connect(gain);
gain.connect(context.destination);

// start playback:
osc.start();
```

Note that we don't directly instantiate our oscillator and gain nodes.
Instead, we use an `AudioContext` object as a "factor" to get those objects.
All WebAudio node types are created this way.

## Wrapping into a Class
We can take this logic and wrap it neatly into a class.
We'll refactor our frequency and gain setting to be setters on the class:
```javascript
class Synth {
  constructor() {
    this.context = new AudioContext();

    // Create an oscillator and set its frequency and waveform
    this.osc = this.context.createOscillator();
    this.frequency = 220;
    this.osc.type = 'square';

    // create a gain node for controlling volume
    this.gain = this.context.createGain();
    this.volume = 0.0;

    // connect the oscillator to the gain node, and then the gain node to the speakers
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    this.osc.start();
  }
  
  set frequency(value) {
    this.osc.frequency.setValueAtTime(value, this.context.currentTime);
  }
  
  set volume(value) {
    this.gain.gain.setValueAtTime(value, this.context.currentTime);
  }
}
```

Now, we set up the synth like this:
```javascript
const synth = new Synth();
synth.frequency = 440;
synth.volume = 0.1;

// wait a bit, then change the frequency:
setTimeout(() => {
    synth.frequency = 220;
}, 1000);
```

## Wiring Up To A UI
Just so we can test things out, let's wire it up to a UI.
Let's create some buttons with some data attributes for pitch, plus a mute button:
```html
<button class="note" data-frequency="220">A4</button>
<button class="note" data-frequency="330">E5</button>
<button class="pause">Pause</button>
```

And, we'll wire all of that up to some listeners.
When you click a `note` button, it'll set the pitch based on what's in the `data-frequency` attribute.
When you click a `pause` button, it'll mute the synth.
```javascript
const synth = new Synth();

const noteButtons = document.querySelectorAll("button.note");
for (const button of noteButtons) {
  button.addEventListener("click", () => {
    synth.frequency = Number(button.dataset.frequency);
    synth.volume = 0.1;
  });
}

document.querySelector("button.pause").addEventListener("click", () => {
  synth.volume = 0.0;
});
```

Since we're doing `querySelectorAll` on the note buttons, we could also add more notes if we wanted.

You can see a full demo of the synth and its UI on codepen:

<p class="codepen" data-height="300" data-default-tab="js,result" data-slug-hash="QWQNyBR" data-user="chipbell4" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/chipbell4/pen/QWQNyBR">
  Small Web Audio Synth</a> by Chip Bell (<a href="https://codepen.io/chipbell4">@chipbell4</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## Conclusion
Okay, so we've now got a reusable class for synthesizing audio!
And with a little bit of HTML, it's not much more code to wire it up to a UI.
In later posts, I'll build on top of this class to build other useful demos.

However, we currently have a limitation: this class only supports _monophonic_ sounds, i.e it can only play a single sound at once.
We'll need to modify this class to support polyphony (multiple notes at once), but let's tackle that in a later post.
See you then!
