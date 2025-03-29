import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from PIL import Image, ImageOps

import tensorflow as tf
import keras
import io
import base64

CLIENT_DEV_URL = "http://localhost:5173"
CLIENT_DEV_PREVIEW_URL = "http://localhost:4173"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = keras.models.load_model("model.keras")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_DEV_URL, CLIENT_DEV_PREVIEW_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Base64ImgDataURL(BaseModel):
    data: str = Field(alias="base64DataURL")


def process_data_url(data_url: str) -> tf.Tensor:
    base64_img_data = data_url.split(",")[1]
    bin_img_data = base64.b64decode(base64_img_data)

    img = Image.open(io.BytesIO(bin_img_data))
    img = img.resize((28, 28))
    img = img.convert("L")
    img = ImageOps.invert(img)
    img.save("./img.png")

    tensor = tf.convert_to_tensor(img, dtype=tf.float32)
    tensor = tensor / 255.0
    tensor = tensor[tf.newaxis, :]
    return tensor


@app.post("/api/predict")
def predict_digit(base64_img_data_url: Base64ImgDataURL) -> int:
    tensor = process_data_url(base64_img_data_url.data)

    predictions = app.state.model.predict(tensor)
    print(predictions.max())

    if predictions.max() < 0.85:
        raise HTTPException(
            status_code=400, detail="Invalid input: Prediction confidence is too low."
        )

    return predictions.argmax().item()
