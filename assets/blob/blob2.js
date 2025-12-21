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

function makeFourierBlob(a0, a, b) {
    const radii = [];
    for (let degrees = 0; degrees < 360; degrees++) {
        const theta = degrees * Math.PI / 180;
        let radius = a0;
        for (let k = 0; k < a.length; k++) {
            radius += a[k] * Math.sin((k + 1) * theta + b[k]);
        }
        radii.push(radius);
    }
    return radii;
}

const singleSineNoShift = makeFourierBlob(75, [50], [0]);
drawBlob(document.getElementById('single-sine-no-shift').getContext('2d'), 100, 100, singleSineNoShift);

const singleSineWithShift = makeFourierBlob(75, [50], [Math.PI / 12]);
drawBlob(document.getElementById('single-sine-with-shift').getContext('2d'), 100, 100, singleSineWithShift);

let b_1 = 0;
const animatedSingleSineContext = document.getElementById('animated-single-sine').getContext('2d');
function animateSingleSine() {
    b_1 += 0.03;

    animatedSingleSineContext.clearRect(0, 0, 200, 200);
    const blob = makeFourierBlob(75, [50], [b_1]);
    drawBlob(animatedSingleSineContext, 100, 100, blob);

    requestAnimationFrame(animateSingleSine);
}
animateSingleSine();

function H(n) {
    let H_n = 0;
    for (let k = 1; k <= n; k++) {
        H_n += 1 / k;
    }
    return H_n;
}

class AnimatedBlob {
    constructor(r, n) {
        this.a = [];
        this.f = [];
        this.beta = [];

        const H_n = H(n);
        const epsilon = r * n / H_n;
        const delta = 1.0
        this.a0 = epsilon / n * H_n + delta;

        for (let k = 0; k < n; k++) {
            // set a
            const top = epsilon / (k + 1) / n;
            const bottom = -top;
            this.a.push(bottom + Math.random() * (top - bottom));

            // set f
            this.f.push(this.f_k(k + 1));

            // set beta, uniform random between 0 and 2pi
            this.beta.push(this.rand(0, Math.PI * 2));
        }
    }

    f_k(k) {
        const T = 1.0; // max period for a blob to circle around
        const right = Math.PI * 2 / T;
        const left = -right;
        return this.rand(left, right);
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

class BetterAnimatedBlob extends AnimatedBlob {
    f_k(k) {
        const T = 1.0; // max period for a blob to circle around
        const right = Math.PI * 2 / T / k;
        const left = -right;
        return this.rand(left, right);
    }
}

const animated = document.getElementById("animated").getContext("2d");
const animated2 = document.getElementById("animated2").getContext("2d");

let blob = new AnimatedBlob(75, 10);
let blob2 = new BetterAnimatedBlob(75, 10);

let t = 0;
function drawAnimated() {
    animated.clearRect(0, 0, 200, 200);
    animated2.clearRect(0, 0, 200, 200);

    blob.draw(animated, t);
    blob2.draw(animated2, t);

    t += 1 / 60;
    requestAnimationFrame(drawAnimated);
}
drawAnimated();
document.getElementById("regenerate").addEventListener("click", () => {
    blob = new AnimatedBlob(75, 10);
});
document.getElementById("regenerate2").addEventListener("click", () => {
    blob2 = new BetterAnimatedBlob(75, 10);
})