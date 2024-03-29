let context;
let bufferSource;
let gain;
let oscillator;

async function loadPCMData(filename) {
    const response = await fetch(filename);
    const buffer = await response.arrayBuffer();
    const pcmData = await context.decodeAudioData(buffer);
    return pcmData;
}

async function setupAudio() {
    context = new AudioContext();

    bufferSource = new AudioBufferSourceNode(context);
    // TODO: load PCM data
    bufferSource.buffer = await loadPCMData("drums.wav");

    bufferSource.loop = true;
    bufferSource.start();

    gain = new GainNode(context, {
        gain: 0.8,
    });

    gain.connect(context.destination);

    oscillator = new OscillatorNode(context, {
        frequency: 220,
        type: "square"
    })
    oscillator.start(); // Don't forget this!
}

async function resetConnections() {
    bufferSource.disconnect();
    oscillator.disconnect();
}

const demos = {
    basic: async () => {
        bufferSource.connect(context.destination);
    },
    lowpass: async () => {
        const biquad = new BiquadFilterNode(context, {
            type: "lowpass",
            frequency: 200,
            Q: 1,
        });

        bufferSource.connect(biquad);
        biquad.connect(context.destination);
    },
    reverb: async () => {
        const reverb = new ConvolverNode(context);
        reverb.buffer = await loadPCMData("impulse_response.wav");

        bufferSource.connect(reverb);
        reverb.connect(context.destination);
    },
    distortion: async () => {
        const SAMPLES = 2048;
        const curve = new Float32Array(SAMPLES);
        const max_volume = 0.2;
        const distortion_amount = 5.0;
        for (let i = 0; i < SAMPLES; i++) {
            const x = (i * 2 / SAMPLES) - 1;
            curve[i] = max_volume * Math.sign(x) * Math.pow(Math.abs(x), 1 / distortion_amount)
        }

        const distortion = new WaveShaperNode(context);
        distortion.curve = curve;
        distortion.oversample = "4x";

        bufferSource.connect(distortion);
        distortion.connect(context.destination);
    },
    oscillators: async () => {
        // Some extra gain because oscillators are so loud
        let gain2 = new GainNode(context, {
            gain: 0.05,
        });
        oscillator.connect(gain2);
        gain2.connect(gain);
        gain.connect(context.destination);
    },
}