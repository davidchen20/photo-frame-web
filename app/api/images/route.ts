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
        .from('photos')
        .createSignedUrl(file.name, 3600);

      return data?.signedUrl;
    })
  );

  return NextResponse.json(signedUrls.filter(Boolean));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Ensure the file is a BMP
    if (!file.name.toLowerCase().endsWith('.bmp')) {
      return NextResponse.json({ error: 'Only .bmp files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to the exact same 'frame-photos' bucket as route.ts
    const { data, error } = await supabase
      .storage
      .from('photos') 
      .upload(file.name, buffer, {
        contentType: 'image/bmp',
        upsert: true, // Overwrite if file with same name exists
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}