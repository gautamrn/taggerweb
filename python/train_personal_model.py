import sys
import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import pickle
import librosa

def extract_features(audio_path):
    """Extract audio features using librosa"""
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=22050, duration=30.0)
        
        # Extract features
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        # Calculate statistics
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

def train_personal_model(user_id, tracks_data):
    """
    Train a personalized scikit-learn model using stored features
    tracks_data: list of dicts with 'audioPath' and 'tags'
    """
    try:
        # Extract features and prepare training data
        X = []  # Features
        y = []  # Labels (tags)
        
        for track in tracks_data:
            if 'audioPath' in track and track['audioPath']:
                # Extract features from audio file
                features = extract_features(track['audioPath'])
                if features and 'tags' in track and track['tags']:
                    X.append(list(features.values()))
                    # Use the highest confidence tag as the label
                    best_tag = max(track['tags'], key=lambda x: x['confidence'])
                    y.append(best_tag['tag'])
        
        if len(X) < 5:
            result = {
                "success": False,
                "error": f"Need at least 5 tracks with features. Got {len(X)}"
            }
            print(json.dumps(result))
            return result
        
        # Convert to numpy arrays
        X = np.array(X)
        y = np.array(y)
        
        # Encode labels
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Create and train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        test_accuracy = accuracy_score(y_test, y_pred)
        
        # Save model to file (for file-based access)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)  # Go up one level from python/ to project root
        models_dir = os.path.join(project_root, "models")
        os.makedirs(models_dir, exist_ok=True)
        
        model_path = os.path.join(models_dir, f"user_{user_id}_model.pkl")
        encoder_path = os.path.join(models_dir, f"user_{user_id}_encoder.pkl")
        
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        with open(encoder_path, 'wb') as f:
            pickle.dump(label_encoder, f)
        
        # Also save model info
        model_info = {
            "userId": user_id,
            "accuracy": float(test_accuracy),
            "lastTrained": "2024-01-01T00:00:00Z",  # Will be updated by backend
            "tracksUsed": len(X),
            "uniqueTags": len(label_encoder.classes_),
            "classes": label_encoder.classes_.tolist()
        }
        
        info_path = os.path.join(models_dir, f"user_{user_id}_info.json")
        with open(info_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        
        result = {
            "success": True,
            "accuracy": float(test_accuracy),
            "user_id": user_id,
            "tracks_trained": len(X),
            "unique_tags": len(label_encoder.classes_),
            "classes": label_encoder.classes_.tolist()
        }
        
        print(json.dumps(result))
        return result
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "user_id": user_id
        }
        print(json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    if len(sys.argv) < 3:
        error_result = {
            "success": False,
            "error": "Usage: python train_personal_model.py <user_id> <tracks_json>"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    user_id = sys.argv[1]
    tracks_json = sys.argv[2]
    
    tracks_data = json.loads(tracks_json)
    train_personal_model(user_id, tracks_data)
