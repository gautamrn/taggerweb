import { NextResponse } from "next/server"
import nextConnect from 'next-connect'

//file uploads
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process/promises'



const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads');
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

const PY = path.join(process.cwd(), 'python')

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            const tagDir = path.join(UPLOAD_DIR, req.body.tag);
            fs.mkdirSync(tagDir, {recursive: true});
            cb(null, tagDir);
        },
        filename: (req, file, cb) =>{
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            cb(null, `${timestamp}${ext}`);
        }
    }),
});



const handler = nextConnect({
    onError(err, _req, res){
        res.status(500).json({error: err.message});
    },
    onNoMatch(_req, res){
        res.status(405).json({error: 'Method not allowed'});
    },
});


handler.use(upload.array('tracks'));

handler.post(async (req, res) => {
  const tag = req.body.tag.replace(/\s+/g, '_');
  
  
  try {
    await spawn('python', [
        path.join(PY, 'generate_spectogram.py'),
        '--input_dir', path.join(UPLOAD_DIR, tag),
        '--output_dir', path.join(process.cwd(), 'spectograms', tag)
    ], { stdio: 'inherit' });

    console.log('✓ Spectrograms generated');

    await spawn('python', [
        path.join(PY, 'train_model.py'),
        '--data_dir', path.join(process.cwd(), 'spectograms')
    ], { stdio: 'inherit' });

    console.log('✓ Model training complete');

    return res.json({ message: 'Training finished successfully.' });
  } catch (err) {
    console.error('Error during Python execution:', err);
    return res.status(500).json({ error: 'Server error during training.' });
  }
})
