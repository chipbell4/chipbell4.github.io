---
layout: post
title: "Coffee Math"
date: 2025-02-15 21:52:49
categories: math
---

<style>
.label-container {
  display: inline-block;
  width: 14em;
  margin-right: 1em;
  text-align: right;
}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#99ffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};
const SHARED_CONFIG = {
    type: 'scatter',
    // Missing data: [...]
    plugins: [plugin],
    options: {
      elements: {
        point: {
          radius: 2,
        },
        line: {
          borderWidth: 2,
        },
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: "#e5f3ff",
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          suggestedMin: 0,
        },
        y: {
        }
      }
    }
  };

</script>

## Introduction
I was drinking my normal cup (or three) of coffee the other morning and I reflected on some of the interesting math behind it all, as one does.
As I thought, I realized that there’s some more interesting math behind how caffeine moves in our body than meets the eye, and that it would make an interesting topic for me to write about.
So, here goes!

## A Simplified Model of Caffeine, er... Elimination
When we consume coffee, or any caffeinated beverage, it stays in our body for a while and then leaves in, shall we say, a liquid form.
Interestingly, caffeine doesn’t leave our body at a constant rate, but rather has a “half life”.
This half-life can vary, but [this source](https://go.drugbank.com/drugs/DB00201#pharmacology) says 5 hours.
That means that if there are $C$ mg of caffeine in your body at 9:00 am, at 2:00 pm there will only be $\frac{C}{2}$ mg remaining.
We can state this as a differential equation:

$$
\frac{dC}{dt} = kC
$$

We can solve for C using some Calc 1 hand-waving:

$$
\frac{dC}{C} = kdt
$$

$$
\int \frac{dC}{C} = \int kdt = \ln{C} = kt + A
$$

$$
C = e^{kt + A} = \alpha e^{kt}
$$

At $t=0$, $C(t) = \alpha$, so we'll rewrite it like this for clarity:

$$
C(t) = C(0) e^{kt}
$$

Given some half-life $h$, we know that from some starting point (say $t=0$) that $h$ units of time later half the caffeine will remain in our body:

$$
C(h) = \frac{C(0)}{2} = C(0) e^{kh}
$$

$$
\frac{1}{2} = e^{kh}
$$

$$
\ln{\frac{1}{2}} = kh
$$

$$
-\ln{2} = kh
$$

$$
k = \frac{-\ln{2}}{h}
$$

## Modeling Coffee Consumption
[Accordingly to Mayo Clinic](https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/caffeine/art-20049372) a cup of coffee has about 96mg of caffeine.
I typically drink 3 cups of coffee a day (288mg), and space that over the course of 2(-ish) hours.
That comes out to $\frac{144 mg}{hr}$ on average.

### A Brief Heaviside Aside
In order to model coffee consumption, we're going to need a new tool.
This tool is the [Heaviside step function](https://en.wikipedia.org/wiki/Heaviside_step_function) which is defined as a piecewise function:

$$
  H(t) = \begin{cases}
    0 & t \lt 0 \\
    1 & t \geq 0 \\
  \end{cases}
$$

Here's what it looks like graphed:

<canvas id="heaviside"></canvas>
<script>
const heaviside = document.getElementById("heaviside");
new Chart(heaviside, {
  ...SHARED_CONFIG,
  data: {
    datasets: [{
      label: "Heaviside Function",
      data: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      showLine: true,
      backgroundColor: "red"
    }]
  }
});
</script>

In a way, you can see this function as modeling a "switch turning on" at $t=0$.

We can combine two of these functions to create a "impulse" function. That is, a function that "turns on" for a period $\tau$ then "turns off":

$$
R(t; \tau) = H(t) - H(t - \tau)
$$

Here's an example for $\tau = 2$.

<canvas id="impulse"></canvas>
<script>
const impulse = document.getElementById("impulse");
new Chart(impulse, {
  ...SHARED_CONFIG,
  data: {
    datasets: [{
      label: "Impulse Function",
      data: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      showLine: true,
      backgroundColor: "red"
    }]
  }
});
</script>

### A Heaviside Drinking Function
Using this impulse function $R$, we can scale it such that it models my caffeine intake.
If I drink for 2 hours, $\tau = 2$.
And, if we multiple $R$ by the amount of coffee I consume an hour we have a function that for any $t$ models the rate caffeine enters my system.
We'll call that function $D(t)$ ("D" for "drink" of course!):

$$
D(t) = 144 R(t; 2)
$$

But we can generalize this a little better.
If we drink $n$ cups of of some caffeined beverage with $m$ mg of caffeine over a period of $\tau$ hours we end up with a caffeine ingestion rate of $\frac{mn}{\tau}$ mg per hour.
This gives

$$
D(t) = \frac{mn}{\tau} R(t; \tau)
$$

or

$$
D(t) = \frac{mn}{\tau} \left( H(t) - H(t - \tau) \right)
$$

### A New Differential Equation
We can now update our original differential equation to include caffeine intake along with our existing model for caffeine half-life:

$$
\frac{dC}{dt} = kC + \frac{mn}{\tau} \left( H(t) - H(t - \tau) \right)
$$

## A Numerical Solution
There's a few methods out there, but we can most easily get a quick approximation of the behavior of that differential equation with [Euler's Method](https://en.wikipedia.org/wiki/Euler_method):

$$
C(t + \delta t) = C(t) + \delta t \frac{dC(t)}{dt}
$$

Here's an interactive graph of that over a 24 hour period.
Note that $t=0$ corresponds to "when you first start drinking coffee".
So, a 7:00am cup of coffee would correspond to a bedtime of around $t = 16$ for 8 hours of sleep.

<canvas id="graph"></canvas>

<label id="cups">
  <span class="label-container">
      Cups
      <span class="value-text"></span>
  </span>
  <input type="range" min="1" max="10" value="3" step=1 />
</label>
<br />

<label id="caffeine">
  <span class="label-container">
      mg Caffeine Per Cup
      <span class="value-text"></span>
  </span>
  <input type="range" min="10" max="100" value="96" step=1 />
</label>
<br />

<label id="duration">
  <span class="label-container">
      Drink Duration in hours
      <span class="value-text"></span>
  </span>
  <input type="range" min="0.5" max="12" value="2" step="0.01" />
</label>
<br />

<script>
// Building my own framework I guess?
function dataBind(id, onChange) {
  const label = document.getElementById(id);
  const input = label.querySelector("input[type=range]");
  const valueText = label.querySelector("span.value-text");

  let value = input.value;
  
  const onInput = () => {
    value = input.valueAsNumber;
    valueText.innerText = `(${value})`;

    onChange && onChange(value)
  }
  input.addEventListener("input", onInput);
  onInput();
  onChange && onChange(value);
}

let state = {
  cups: 1,
  caffeine: 1,
  duration: 1,
};

const canvas = document.getElementById("graph");
let chart = null;
function redraw() {
  let dt = 0.01; // small enough, I guess?
  const chartData = []

  // some constants we're gonna need
  const k = -Math.log(2) / 5; // Decay term for half life
  const mnOverTau = state.caffeine * state.cups / state.duration // Scale term for heaviside

  let C = 0.0; // no caffeine in the system yet
  for (let t = 0.0; t < 24; t += dt) {
    chartData.push({
      x: t,
      y: C,
    });

    // Calculate dC / dt
    let impulse = t < state.duration ? 1 : 0; // stop drinking after state.duration
    let dCdt = k * C + mnOverTau * impulse;

    // update C using Euler's method
    C = C + dt * dCdt;
  }

  if (chart !== null) {
    chart.destroy();
  }

  chart = new Chart(canvas, {
    ...SHARED_CONFIG,
    data: {
      datasets: [{
        label: "Caffeine (mg)",
        data: chartData,
        showLine: true,
        backgroundColor: "red",
      }]
    }
  }); 
}

let redrawTimeout = -1;
function scheduleRedraw() {
  clearTimeout(redrawTimeout)
  redrawTimeout = setTimeout(redraw, 1500);
}

dataBind("cups", (value) => {
  state.cups = value;
  scheduleRedraw();
});

dataBind("caffeine", (value) => {
  state.caffeine = value;
  scheduleRedraw();
});

dataBind("duration", (value) => {
  state.duration = value;
  scheduleRedraw();
});

</script>

So this is super fun to play with IMO, and it shows some cool properties of this system:
- If you drink your coffee very fast, you get a bigger "jolt" because you give the "first" caffeine less time to leave your body before the last bit comes in.
- If you drink your coffee slowly, you end up going to bed with more caffeine in your system because the last bit of caffeine has less time to leave your body before bedtime.

## Some Final Thoughts and Potential Next Steps
Some remaining things to explore with this model would be to consider an algebraic solution to the differential equation.
[Laplace transforms](https://en.wikipedia.org/wiki/Laplace_transform#Table_of_selected_Laplace_transforms) are an ideal candidate for this sort of problem, and can potentially empower us to consider other models for how caffeine enters our body.
For example, our current model is setup to handle a single day, but I typically drink coffee every morning.
Could we model $D(t)$ as periodic function?
And if $D(t)$ is periodic, could some sort of Fourier analysis help here?

And, as interesting as I think this model is, it only models caffeine in your body and not necessarily its effects.
To model that better we'd have to consider some pharmalogical effects like:
- [Onset of Action](https://en.wikipedia.org/wiki/Onset_of_action) which would potentially delay when the caffeine actually hits your bloodstream, not instantaneously upon drinking like we did here.
- [Duration of Action](https://en.wikipedia.org/wiki/Pharmacodynamics#Duration_of_action) which would give us a better model of how the effect of caffeine changes over time in your body. There may be models for that as well. 

There's potentially other pharmacological things to consider that I'm unaware of, but those two factors alone could convert this into a reasonably complex system of equations.
These systems may not be solvable by hand, and we'd have to resort to a numerical approach like Euler's method or Runge-Kutta.

These all sound like topics for later writing...
Until then!

