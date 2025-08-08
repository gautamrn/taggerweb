import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import load_img, img_to_array, ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping



def load_data(image_dir, image_size=(128, 128)):
    genres = os.listdir(image_dir)
    X = []
    Y = []
    label_map = {genre: idx for idx, genre in enumerate(genres)}

    for genre in genres:
        genre_dir = os.path.join(image_dir, genre)
        for filename in os.listdir(genre_dir):
            if filename.endswith(".png"):
                path = os.path.join(genre_dir, filename)
                image = load_img(path, target_size=image_size)
                image = img_to_array(image)
                X.append(image)
                Y.append(label_map[genre])
    
    return np.array(X), np.array(Y), label_map

X, Y, label_map = load_data("spectograms")
X = X/255 #pixels

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),

    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),

    layers.Flatten(),
    layers.Dropout(0.25),
    layers.Dense(64, activation='relu'),
    layers.Dense(len(label_map), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])


datagen = ImageDataGenerator(
    width_shift_range = 0.1,
    height_shift_range = 0.1,
    zoom_range = 0.1,
    brightness_range=[0.8, 1.2]
)


early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

history = model.fit(datagen.flow(X_train, Y_train, batch_size=32), epochs=20, validation_data=(X_test, Y_test))

test_loss, test_acc = model.evaluate(X_test, Y_test, verbose=2)
print(f"Test accuracy: {test_acc:.2f}")

model.save("genre_classifier_model.keras")
print("Genre label mapping:", label_map)
