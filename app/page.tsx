'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  const UPLOAD_PASSWORD = process.env.NEXT_PUBLIC_UPLOAD_PASSWORD;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Make it so you need a password to upload
    if (password !== UPLOAD_PASSWORD) {
      setStatus('Error: Incorrect password.');
      return;
    }

    setUploading(true);
    setStatus('Uploading image to private storage...');

    // Sanitize filename with timestamp
    const ext = file.name.split('.').pop();
    const fileName = `photo_${Date.now()}.${ext}`;

    const { error } = await supabase
      .storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploading(false);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Upload successful! The photo frame will display this on its next refresh cycle.');
      setFile(null);
      setPassword('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-1">Photo Frame Uploader</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Upload 24-bit .BMP images to your cloud frame
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            accept=".bmp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
          />

          <input
            type="password"
            placeholder="Enter password to upload"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 text-white placeholder-slate-400 text-sm px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={!file || !password || uploading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>

        {status && (
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-sm text-center text-slate-200">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}