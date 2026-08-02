import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data: files, error } = await supabase
    .storage
    .from('frame-photos')
    .list('', { sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bmpFiles = files.filter((f) => f.name.toLowerCase().endsWith('.bmp'));

  const signedUrls = await Promise.all(
    bmpFiles.map(async (file) => {
      const { data } = await supabase
        .storage
        .from('frame-photos')
        .createSignedUrl(file.name, 3600);

      return data?.signedUrl;
    })
  );

  return NextResponse.json(signedUrls.filter(Boolean));
}