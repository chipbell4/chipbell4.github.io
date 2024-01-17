let context;
let bufferSource;

async function loadPCMData(filename) {
    const buffer = await fetch(path);
    const pcmData = await context.decodeAudioData(buffer);
    return pcmData;
}

async function setupAudio() {
    console.log("Setting up audio!");
}