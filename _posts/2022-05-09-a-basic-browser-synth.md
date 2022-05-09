---
layout: post
title: "A Basic Browser Synth using Web Audio"
date: 2022-05-09 08:03:35
categories: javascript webaudio
---

## Overview
I've started planning out posts for this blog, and I realize that I'm going to need a nice way to generate sounds programmatically.
WebAudio, probably my favorite browser API, provides some nice audio synthesis capabilities which we'll use in this post to build a small monophonic synthesizer.

## WebAudio Basics

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

Core to the process is using an `AudioContext` to create the different audio nodes we need.

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

Since we're doing `querySelectorAll` on the note buttons, we can certainly add more notes if we wanted, but this is enough for now.

You can see a full demo of the synth and its UI on codepen:

<p class="codepen" data-height="300" data-default-tab="js,result" data-slug-hash="QWQNyBR" data-user="chipbell4" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/chipbell4/pen/QWQNyBR">
  Small Web Audio Synth</a> by Chip Bell (<a href="https://codepen.io/chipbell4">@chipbell4</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
## Conclusion
