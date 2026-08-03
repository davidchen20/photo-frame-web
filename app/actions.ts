'use server';
import { createClient } from "@supabase/supabase-js";

export async function uploadPhotoAction(formData: FormData) {
  const password = formData.get('password') as string;
  const file = formData.get('file') as File;

  // 1. Verify password on the server
  if (!password || password !== process.env.UPLOAD_PASSWORD) {
    return { success: false, error: 'Incorrect password.' };
  }

  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a valid file.' };
  }

  // 2. Initialize Supabase Admin Client using server-only credentials
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Prepare file for server-side upload
  const ext = file.name.split('.').pop();
  const fileName = `photo_${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 4. Upload to Supabase
  const { error } = await supabaseAdmin.storage
    .from('photos')
    .upload(fileName, buffer, {
      contentType: file.type || 'image/bmp',
      upsert: false,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}