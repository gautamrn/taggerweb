import { NextResponse } from "next/server"
import nextConnect from 'next-connect'

//file uploads
import multer from 'multer'
import path from 'path'
import fs from 'fs'


const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads');
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (req, file, cb) =>{
            const tag = req.body.tag.replace(/\s+/g, '_');
            const ext = path.extname(file.originalname);
            cb(null, `${tag}-${Date.now()}${ext}`);
        },
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
handler.post((req, res) => {
    console.log('Vibe tag:', req.body.tag);
    console.log('Saved files:', req.files.map(f => f.path));

    res.json({message: 'Upload recieved'});
});

export const POST = handler
export const config = { api: { bodyParser: false } }
