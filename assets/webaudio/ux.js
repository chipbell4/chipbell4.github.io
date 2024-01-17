const button = document.querySelector("#demo-button");
const container = document.querySelector("#demo-container");

button.addEventListener("click", async () => {
    container.classList.remove("hidden");
    button.classList.add("hidden");

    await setupAudio();
});