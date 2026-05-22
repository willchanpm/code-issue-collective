import os
import fal_client
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

now = datetime.now()
time_now = now.strftime("%H:%M:%S")#:%f")
date_now = now.strftime("%A, %B %d, %Y")

FAL_KEY = os.getenv("FAL_KEY")

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/elevenlabs/tts/eleven-v3",
    arguments={
        "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)