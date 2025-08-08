import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

const PY_DIR = path.join(process.cwd(), 'python');
const DATA_DIR = path.join(process.cwd(), 'data');
const SPECT_DIR = path.join(process.cwd(), 'spectograms');
const MODEL_DIR = path.join(process.cwd(), 'models');

// Ensure necessary folders exist
for (const dir of [DATA_DIR, SPECT_DIR, MODEL_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

// Promisified spawn wrapper
const runPython = (cmd, args) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Python process exited with code ${code}`));
    });
  });
};



export async function POST(request) {
  try {
    const formData = await request.formData();
    const tag = formData.get('tag');
    const files = formData.getAll('tracks');
    
    if (!tag || files.length === 0) {
      return NextResponse.json({ error: 'Tag and files are required' }, { status: 400 });
    }
    
    const tagDir = tag.replace(/\s+/g, '_');
    const inputDir = path.join(DATA_DIR, tagDir);
    const outputDir = path.join(SPECT_DIR, tagDir);
    const modelPath = path.join(MODEL_DIR, `${tagDir}.keras`);
    
    // Save uploaded files
    fs.mkdirSync(inputDir, { recursive: true });
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const filename = Date.now() + path.extname(file.name);
      fs.writeFileSync(path.join(inputDir, filename), Buffer.from(buffer));
    }
    
    // 1. Generate spectrograms
    await runPython('python', [
      path.join(PY_DIR, 'generate_spectogram.py'),
      '--input_dir', inputDir,
      '--output_dir', outputDir,
    ]);
    
    // 2. Train the model
    await runPython('python', [
      path.join(PY_DIR, 'train_model.py'),
      '--data_dir', outputDir,
      '--model_path', modelPath,
    ]);
    
    return NextResponse.json({
      message: 'Training complete',
      model: `${tagDir}.keras`,
    });
    
  } catch (error) {
    console.error('API Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


