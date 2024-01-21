const button = document.querySelector("#demo-button");
const container = document.querySelector("#demo-container");

button.addEventListener("click", async () => {
    container.classList.remove("hidden");
    button.classList.add("hidden");

    await setupAudio();
});


// setup demo buttons
for (let button of document.querySelectorAll(".demo")) {
    button.addEventListener("click", async () => {
        await resetConnections();

        const id = button.id;
        console.log(`Playing demo ${id}`)
        await demos[id]();
    });
}

document.querySelector("#stop").addEventListener("click", async () => {
    await resetConnections();
});