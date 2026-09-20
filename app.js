/* ZELO — ACESSIBILIDADE + INTERAÇÕES INICIAIS */

const root = document.documentElement;
const body = document.body;

let fontScale = 1;

const increaseFont = document.getElementById("increaseFont");
const decreaseFont = document.getElementById("decreaseFont");

if (increaseFont) increaseFont.addEventListener("click", () => {
    if (fontScale < 1.3) {
        fontScale += 0.1;
        root.style.setProperty("--font-scale", fontScale);
    }
});

if (decreaseFont) decreaseFont.addEventListener("click", () => {
    if (fontScale > 0.8) {
        fontScale -= 0.1;
        root.style.setProperty("--font-scale", fontScale);
    }
});

const highContrast = document.getElementById("highContrast");

if (highContrast) highContrast.addEventListener("click", () => {
    body.classList.toggle("high-contrast");
});

const readPage = document.getElementById("readPage");

if (readPage) readPage.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
        alert("Seu navegador não oferece leitura de texto.");
        return;
    }

    speechSynthesis.cancel();

    const text = document.querySelector("main").innerText;
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "pt-BR";
    speech.rate = 0.9;
    speech.pitch = 1;

    speechSynthesis.speak(speech);
});

const medicationButton =
    document.querySelector(".medication-card .primary-small");

if (medicationButton) medicationButton.addEventListener("click", () => {
    medicationButton.textContent = "✓ Registrado";
    medicationButton.style.background = "#3f8d79";
});

document.querySelectorAll(".quick-action").forEach(button => {
    button.addEventListener("click", () => {
        console.log("Módulo selecionado:", button.innerText);
    });
});
