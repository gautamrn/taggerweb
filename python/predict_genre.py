import sys
import os
import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"



label_map = {
    0: "tech house",
    1: "disco house",
    2: "uk garage",
    3: "mainstage-edm"
}

model = load_model("genre_classifier_model.keras")

def audio_to_spectogram_array(audio_path, img_size= (128, 128)):
    y, sr = librosa.load(audio_path, sr=22050, duration=30.0)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_DB = librosa.power_to_db(S, ref=np.max)

    import cv2
    spect = cv2.resize(S_DB, img_size)

    #   normalizeing pixels
    spect_norm = (spect - spect.min())/ (spect.max() - spect.min())
    
    spect_stack = np.stack([spect_norm, spect_norm, spect_norm], axis = -1)
    return spect_stack


def predict_genre(audio_path):
    spec = audio_to_spectogram_array(audio_path)

    x=np.expand_dims(spec, axis = 0)

    preds = model.predict(x)

    idx = np.argmax(preds[0])

    genre = label_map.get(idx, "unknown")

    confidence = float(preds[0][idx])

    return genre, confidence


#to use in terminal
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict_genre.py <path/to/song.mp3>")
        sys.exit(1)

    audio_file = sys.argv[1]
    if not os.path.isfile(audio_file):
        print(f"File not found: {audio_file}")
        sys.exit(1)

    genre, conf = predict_genre(audio_file)
    print(f"Predicted genre: {genre} (confidence: {conf:.2f})")