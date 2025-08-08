'use client'

import { useState } from "react"

export default function TagsPage(){
    const [tagName, setTageName] = useState('');
    const [files, setFiles] = useState([]);
    const [msg, setMsg] = useState('');

    const handleTagChange = e => setTageName(e.target.value);

    const handleFileChange = e => setFiles(Array.from(e.target.files));

    const handleUpload = async () => {
        if(!tagName || files.length < 10){
            setMsg('Create a tag and upload atleast 10 songs');
            return;
        }
        const formData = new FormData();
        formData.append('tag', tagName);
        files.forEach(f => formData.append('tracks', f));

        const res = await fetch('/api/upload', {method: 'POST', body: formData});
        setMsg(res.ok ? 'Upload success. Training will start' : 'Upload failed');
        
    }

    return(
        <main style={{padding: '2rem'}}>
            <h2>Create a tag and upload songs that fit the tag</h2>
            <label>
                Tag name: <input value={tagName} onChange={handleTagChange} />
            </label>

            <div style={{margin: '1rem 0'}}>
                <label>
                    Audio files <input type="file" multiple accept=".mp3, .wav" onChange={handleFileChange}/>
                </label>
                {files.length > 0 && <p>{files.length} files(s) selected</p>}
            </div>

            <button onClick={handleUpload}>Upload and Train</button>

            {msg && <p style={{ marginTop: '1rem' }}>{msg}</p>}
        </main>
    );
}