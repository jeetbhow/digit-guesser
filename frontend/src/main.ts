import "./canvas.css";
import "./tools.css";

import $ from "jquery";

const PENCIL_CURSOR_CLASS_NAME = "pencil-cursor";

let pencilToolActive = false;
let isDrawing = false;
let mouseLastX = 0;
let mouseLastY = 0;

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
ctx.lineWidth = 10;

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
    pencilToolActive = false;
    document.body.classList.remove(PENCIL_CURSOR_CLASS_NAME);
});
