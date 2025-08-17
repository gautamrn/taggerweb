const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class AIService {
  constructor() {
    // Fix the path to point to the correct python folder
    this.pythonPath = path.join(__dirname, '../../../python');
    
    // Use the virtual environment Python if it exists, otherwise use system Python
    this.pythonExecutable = this.getPythonExecutable();
  }

  // Get the correct Python executable
  getPythonExecutable() {
    const venvPython = path.join(__dirname, '../../../venv/Scripts/python.exe');
    const systemPython = 'python';
    
    try {
      // Check if virtual environment exists
      if (require('fs').existsSync(venvPython)) {
        console.log('Using virtual environment Python:', venvPython);
        return venvPython;
      } else {
        console.log('Virtual environment not found, using system Python');
        return systemPython;
      }
    } catch (error) {
      console.log('Error checking virtual environment, using system Python:', error.message);
      return systemPython;
    }
  }

  // Train personal model
  async trainPersonalModel(userId, tracksData) {
    return new Promise((resolve, reject) => {
      console.log('Training personal model for user:', userId);
      console.log('Using Python executable:', this.pythonExecutable);
      
      const tracksJson = JSON.stringify(tracksData);
      
      const process = spawn(this.pythonExecutable, [
        path.join(this.pythonPath, 'train_personal_model.py'),
        userId.toString(),
        tracksJson
      ]);

      let output = '';
      let errorOutput = '';

      // Add timeout (5 minutes for training)
      const timeout = setTimeout(() => {
        console.error('Training timed out after 5 minutes');
        process.kill('SIGTERM');
        reject(new Error('Training timed out'));
      }, 300000);

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeout);
        console.log('Training finished with code:', code);
        console.log('Training output:', output);
        console.log('Training error output:', errorOutput);
        
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            console.error('Failed to parse training result:', e);
            console.error('Raw output:', output);
            reject(new Error('Failed to parse training result'));
          }
        } else {
          console.error('Training failed:', errorOutput);
          reject(new Error(`Training failed: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Process error:', error);
        reject(error);
      });
    });
  }

  // Default prediction (empty - user must add custom tags)
  async predictGenreDefault(audioPath) {
    // Return empty predictions - user must add custom tags
    // This forces users to train their personal model
    return [];
  }

  // Predict using personal model from file
  async predictGenrePersonalFromFile(audioPath, userId) {
    return new Promise((resolve, reject) => {
      console.log('Running personal prediction from file for user:', userId);
      
      const process = spawn(this.pythonExecutable, [
        path.join(this.pythonPath, 'predict_personal_from_file.py'),
        audioPath,
        userId.toString()
      ]);

      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        console.error('Personal prediction timed out after 30 seconds');
        process.kill('SIGTERM');
        reject(new Error('Personal prediction timed out'));
      }, 30000);

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeout);
        console.log('Personal prediction finished with code:', code);
        console.log('Prediction output:', output);
        console.log('Prediction error output:', errorOutput);
        
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.success) {
              resolve(result.predictions);
            } else {
              console.error('Personal prediction failed:', result.error);
              reject(new Error(result.error));
            }
          } catch (e) {
            console.error('Failed to parse personal prediction:', e);
            reject(new Error('Failed to parse prediction result'));
          }
        } else {
          console.error('Personal prediction failed:', errorOutput);
          reject(new Error(`Prediction failed: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Process error:', error);
        reject(error);
      });
    });
  }
}

module.exports = new AIService();
