import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel

import tensorflow as tf
import keras

app = FastAPI()


class Image(BaseModel):
    width: int
    height: int
    img: list[int]


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = keras.models.load_model("model.keras")
    yield
