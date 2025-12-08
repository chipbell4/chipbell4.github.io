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

// INITIAL
let ctx = document.querySelector('#initial').getContext('2d');

// For now, each radius is the the same, which will give us a circle
let blob = [];
let RADIUS = 50;
for (let i = 0; i < 360; i++) {
    blob.push(RADIUS);
}

drawBlob(ctx, 100, 100, blob);

// RANDOM
ctx = document.querySelector('#random').getContext('2d');

// For now, each radius is the the same, which will give us a circle
blob = [];
for (let i = 0; i < 360; i++) {
    const radius = 40 + Math.random() * 20;
    blob.push(radius);
}

drawBlob(ctx, 100, 100, blob);

// LIVE DEMO
function redrawLiveDemo() {
    const epsilon = Number(document.getElementById('live-epsilon').value);
    const n = 10;
    const H_n = 2.92897;
    const delta = 1.0;
    const a_0 = epsilon / n * H_n + delta;

    const a = [];
    const b = [];
    for (let k = 0; k < n; k++) {
        const top = epsilon / (k + 1) / n;
        const bottom = -top;
        a.push(bottom + Math.random() * (top - bottom));
        b.push(Math.random() * 2 * Math.PI);
    }

    const radii = [];
    for (let i = 0; i < 360; i++) {
        const theta = i / 180 * Math.PI;
        let radius = a_0;
        for (let k = 0; k < n; k++) {
            radius += a[k] * Math.sin(k * theta + b[k]);
        }
        radii.push(radius);
    }

    const ctx = document.getElementById('live-demo').getContext('2d');
    ctx.clearRect(0, 0, 200, 200);
    console.log(radii);
    drawBlob(ctx, 100, 100, radii);
}
document.getElementById('live-epsilon').addEventListener('change', redrawLiveDemo);
redrawLiveDemo();

function makeFixedRadiusBlob(target) {
    const H_n = 2.92897;
    const n = 10;
    const epsilon = 75 * n / H_n;
    const delta = 1.0;
    const a_0 = epsilon / n * H_n + delta;

    const a = [];
    const b = [];
    for (let k = 0; k < n; k++) {
        const top = epsilon / (k + 1) / n;
        const bottom = -top;
        a.push(bottom + Math.random() * (top - bottom));
        b.push(Math.random() * 2 * Math.PI);
    }

    const radii = [];
    for (let i = 0; i < 360; i++) {
        const theta = i / 180 * Math.PI;
        let radius = a_0;
        for (let k = 0; k < n; k++) {
            radius += a[k] * Math.sin(k * theta + b[k]);
        }
        radii.push(radius);
    }

    ctx = document.getElementById(target).getContext('2d');
    ctx.clearRect(0, 0, 200, 200);
    drawBlob(ctx, 100, 100, radii)
}
makeFixedRadiusBlob('blob-with-radius');
document.getElementById("make-another").addEventListener("click", () => makeFixedRadiusBlob('blob-with-radius'));
makeFixedRadiusBlob('final-result');

function boxcar(radii, w) {
    const newRadii = [];
    for (let i = 0; i < radii.length; i++) {
        let sum = 0;
        for (let k = -w; k <= w; k++) {
            sum += radii[(i + k + radii.length) % radii.length];
        }
        newRadii.push(sum / (2 * w + 1));
    }
    return newRadii;
}

function makeNewRandomizedBlob() {
    const delta = Number(document.getElementById("live-delta").value);
    const w = Number(document.getElementById("live-w").value);

    // update the live DOM
    document.querySelector("[for=live-delta]").innerText = `Delta Value: ${delta}`;
    document.querySelector("[for=live-w]").innerText = `W Value: ${w}`;

    // create random points
    const radius = 75;
    const radii = [];
    for (let i = 0; i < 360; i++) {
        const left = radius - delta;
        const right = radius + delta;
        radii.push(left + Math.random() * (right - left));
    }

    // filter
    const filteredRadius = boxcar(radii, w);

    // draw it
    const ctx = document.getElementById("boxcar-blob").getContext("2d");
    ctx.clearRect(0, 0, 200, 200);
    drawBlob(ctx, 100, 100, filteredRadius);
}
document.getElementById("live-delta").addEventListener("change", makeNewRandomizedBlob);
document.getElementById("live-w").addEventListener("change", makeNewRandomizedBlob);
makeNewRandomizedBlob();