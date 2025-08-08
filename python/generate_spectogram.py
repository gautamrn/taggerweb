import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
import os
import argparse

def save_spectrogram(audio_path, save_path):
    y, sr = librosa.load(audio_path, sr=22050)

    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_DB = librosa.power_to_db(S, ref=np.max)

    plt.figure(figsize=(4, 4))
    librosa.display.specshow(S_DB, sr=sr, hop_length=512, cmap='magma')
    plt.axis('off')

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def main(input_dir, output_dir):
    for genre in os.listdir(input_dir):
        genre_path = os.path.join(input_dir, genre)
        
        if not os.path.isdir(genre_path):
            continue

        for filename in os.listdir(genre_path):
            if filename.lower().endswith(('.mp3', '.wav')):
                audio_path = os.path.join(genre_path, filename)
                png_name = os.path.splitext(filename)[0] + '.png'
                save_path = os.path.join(output_dir, genre, png_name)
                print(f"Generating spectograms: {audio_path} - {save_path}")
                
                save_spectrogram(audio_path, save_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_dir',  required=True, help="Root folder of audio by genre")
    parser.add_argument('--output_dir', required=True, help="Where to save spectrogram PNGs")
    args = parser.parse_args()
    main(args.input_dir, args.output_dir)
