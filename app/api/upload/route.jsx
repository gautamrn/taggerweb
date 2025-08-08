import nextConnect from 'next-connect'

//file uploads
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process/promises'

const PY_DIR    = path.join(process.cwd(), 'python')
const DATA_DIR  = path.join(process.cwd(), 'data')
const SPECT_DIR = path.join(process.cwd(), 'spectograms')
const MODEL_DIR = path.join(process.cwd(), 'models')


for (const d of [DATA_DIR, SPECT_DIR, MODEL_DIR]) fs.mkdirSync(d, {recursive: true})



const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _f, cb) => {
           const d = path.join(DATA_DIR, req.body.tag)
           fs.mkdirSync(d, {recursive: true})
           cb(null, d)
        },
        filename: (_r, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    }),
});



const handler = nextConnect({
    onError(err, _req, res){
        res.status(500).json({error: err.message});
    },
});

handler.use(upload.array('tracks'))


handler.post(async (req, res) => {
  const tag= req.body.tag.replace(/\s+/g,'_')
  const inputDir = path.join(DATA_DIR, tag)
  const specDir = path.join(SPECT_DIR, tag)
  const modelPath = path.join(MODEL_DIR, `${tag}.keras`)
  
  
  try {
    await spawn('python', [
        path.join(PY_DIR,'generate_spectogram.py'),
        '--input_dir',  inputDir,
        '--output_dir', specDir
    ], { stdio:'inherit' })


    await spawn('python', [
        path.join(PY_DIR,'train_model.py'),
        '--data_dir',   SPECT_DIR,
        '--model_path', modelPath
    ], { stdio:'inherit' })

    res.json({message:'Training complete', model: path.basename(modelPath)})

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: ' error during training.' });
  }
})


export const POST   = handler
export const config = { api:{ bodyParser:false } }