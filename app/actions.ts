'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadPhotoAction(formData: FormData) {
  try {
    const password = formData.get('password') as string;
    const file = formData.get('file') as File;

    if (!process.env.UPLOAD_PASSWORD) {
      return { success: false, error: 'Server configuration error: UPLOAD_PASSWORD missing.' };
    }

    if (password !== process.env.UPLOAD_PASSWORD) {
      return { success: false, error: 'Incorrect password.' };
    }

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided or file is empty.' };
    }

    const supabase = await createClient();
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected server error occurred.' };
  }
}