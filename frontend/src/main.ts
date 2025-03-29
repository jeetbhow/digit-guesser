import "./work-area.css";

import $ from "jquery";
import axios from "axios";

const PENCIL_CURSOR_CLASS_NAME = "pencil-cursor";
const SERVER_BASE_URL = "https://digit-guesser.onrender.com";

let pencilToolActive = false;
let isDrawing = false;
let mouseLastX = 0;
let mouseLastY = 0;

const guessText = $("#guess-text");

const pencil = $(".bi-pencil.tool");
pencil.on("click", () => {
    pencilToolActive = true;
    document.body.classList.add(PENCIL_CURSOR_CLASS_NAME);
});

const canvas = $("canvas");
const canvasElem = canvas[0] as HTMLCanvasElement;
const ctx = canvasElem.getContext("2d")!;
ctx.strokeStyle = "black";
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.lineWidth = 20;

setCanvasBackground("white");

canvas.on("mousemove", event => {
    if (!pencilToolActive || !isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(mouseLastX, mouseLastY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    ctx.closePath();

    mouseLastX = event.offsetX;
    mouseLastY = event.offsetY;
});
canvas.on("mousedown", event => {
    const rect = canvasElem.getBoundingClientRect();
    mouseLastX = Math.round(event.clientX - rect.left);
    mouseLastY = Math.round(event.clientY - rect.top);
    ctx.moveTo(mouseLastX, mouseLastY);
    isDrawing = true;
});
canvas.on("mouseup", () => {
    isDrawing = false;
});

const eraser = $(".bi-eraser.tool");
eraser.on("click", () => {
    // More efficient than ctx.reset() since it doesn't reset any context state other than the pixel buffer.
    ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
    setCanvasBackground("white");
    pencilToolActive = false;
    document.body.classList.remove(PENCIL_CURSOR_CLASS_NAME);
    guessText.text("");
});

const guessBtn = $("button");
guessBtn.on("click", async () => {
    const base64DataURL = canvasElem.toDataURL("image/png");

    try {
        const result = await axios.post(`${SERVER_BASE_URL}/api/predict`, {
            base64DataURL,
        });

        guessText.text(`I think you drew a ${result.data}.`);
    } catch (e) {
        guessText.text(`I have no clue what that is.`);
    }
});

function setCanvasBackground(color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
}
