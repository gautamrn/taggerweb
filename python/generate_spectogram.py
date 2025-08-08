import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
import os
import argparse

def save_spectrogram(audio_path, save_path):
    try:
        print(f"[INFO] Loading audio: {audio_path}")
        y, sr = librosa.load(audio_path, sr=22050)
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        S_DB = librosa.power_to_db(S, ref=np.max)

        plt.figure(figsize=(4, 4))
        librosa.display.specshow(S_DB, sr=sr, hop_length=512, cmap='magma')
        plt.axis('off')

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
        plt.close()

        print(f"[SUCCESS] Saved spectrogram → {save_path}")
        return True
    except Exception as e:
        print(f"[ERROR] Could not process {audio_path}: {e}")
        return False

def main(input_dir, output_dir):
    total = successes = failures = 0

    # Does input_dir have any audio files directly?
    direct_files = [
        f for f in os.listdir(input_dir)
        if f.lower().endswith(('.mp3', '.wav'))
    ]

    if direct_files:
        # Flat structure: use the folder name as the genre
        genre = os.path.basename(os.path.normpath(input_dir))
        for filename in direct_files:
            total += 1
            audio_path = os.path.join(input_dir, filename)
            png_name   = os.path.splitext(filename)[0] + '.png'
            save_path  = os.path.join(output_dir, genre, png_name)
            print(f"\n[PROCESS] ({total}) {audio_path} ⇒ {save_path}")
            if save_spectrogram(audio_path, save_path):
                successes += 1
            else:
                failures += 1
    else:
        # Nested structure: subfolder-per-genre
        for genre in os.listdir(input_dir):
            genre_path = os.path.join(input_dir, genre)
            if not os.path.isdir(genre_path):
                continue
            for filename in os.listdir(genre_path):
                if not filename.lower().endswith(('.mp3', '.wav')):
                    continue
                total += 1
                audio_path = os.path.join(genre_path, filename)
                png_name   = os.path.splitext(filename)[0] + '.png'
                save_path  = os.path.join(output_dir, genre, png_name)
                print(f"\n[PROCESS] ({total}) {audio_path} ⇒ {save_path}")
                if save_spectrogram(audio_path, save_path):
                    successes += 1
                else:
                    failures += 1

    # Final summary
    print("\n=== Spectrogram Generation Summary ===")
    print(f"Total files found:      {total}")
    print(f"Successfully processed: {successes}")
    print(f"Failed to process:      {failures}")
    print("======================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch generate spectrograms")
    parser.add_argument('--input_dir',  required=True, help="Folder of audio files (flat or genre subfolders)")
    parser.add_argument('--output_dir', required=True, help="Where to save spectrogram PNGs")
    args = parser.parse_args()
    main(args.input_dir, args.output_dir)
