'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSignedUploadUrlAction } from './actions';

export default function Home() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    const formData = new FormData(form);
    const password = formData.get('password') as string;
    const file = formData.get('file') as File;

    if (!file) return;

    setUploading(true);
    setStatus('Verifying password...');

    // 1. Ask server for permission & signed URL
    const urlResult = await getSignedUploadUrlAction(password, file.name);

    if (!urlResult.success || !urlResult.path || !urlResult.token) {
      setUploading(false);
      setStatus(`Error: ${urlResult.error}`);
      return;
    }

    setStatus('Uploading large file directly to Supabase...');

    // 2. Upload directly from browser to Supabase
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .uploadToSignedUrl(urlResult.path, urlResult.token, file);

    setUploading(false);

    if (uploadError) {
      setStatus(`Upload Error: ${uploadError.message}`);
    } else {
      setStatus('Upload successful!');
      form.reset();
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-1">Photo Frame Uploader</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Upload 24-bit .BMP images to your cloud frame
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            name="file"
            accept=".bmp"
            required
            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password to upload"
            required
            className="w-full bg-slate-700 text-white placeholder-slate-400 text-sm px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={uploading}
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