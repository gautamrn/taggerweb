import sys
import os
import json
import numpy as np
import librosa
import pickle

def extract_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=22050, duration=30.0)
        
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        features = {
            'tempo': float(tempo),
            'spectral_centroid_mean': float(np.mean(spectral_centroids)),
            'spectral_centroid_std': float(np.std(spectral_centroids)),
            'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
            'spectral_rolloff_std': float(np.std(spectral_rolloff)),
            'mfcc_mean': float(np.mean(mfccs)),
            'mfcc_std': float(np.std(mfccs)),
            'chroma_mean': float(np.mean(chroma)),
            'chroma_std': float(np.std(chroma))
        }
        
        return features
    except Exception as e:
        return None

def predict_with_model_from_file(audio_path, user_id):
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        models_dir = os.path.join(project_root, "models")
        
        model_path = os.path.join(models_dir, f"user_{user_id}_model.pkl")
        encoder_path = os.path.join(models_dir, f"user_{user_id}_encoder.pkl")
        
        if not os.path.exists(model_path) or not os.path.exists(encoder_path):
            return {
                "success": False,
                "error": f"Model files not found. Looking for:\n{model_path}\n{encoder_path}"
            }
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(encoder_path, 'rb') as f:
            label_encoder = pickle.load(f)
        
        features = extract_features(audio_path)
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        X = np.array([list(features.values())])
        
        predictions_proba = model.predict_proba(X)[0]
        
        predicted_indices = np.argsort(predictions_proba)[::-1]
        result_predictions = []
        
        for idx in predicted_indices[:3]:
            tag_name = label_encoder.inverse_transform([idx])[0]
            confidence = float(predictions_proba[idx])
            result_predictions.append({
                "tag": tag_name,
                "confidence": confidence
            })
        
        return {
            "success": True,
            "predictions": result_predictions
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        error_result = {
            "success": False,
            "error": "Usage: python predict_personal_from_file.py <audio_path> <user_id>"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    user_id = sys.argv[2]
    
    result = predict_with_model_from_file(audio_path, user_id)
    print(json.dumps(result))
