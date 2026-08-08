'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSignedUploadUrlAction(password: string, filename: string) {
  try {
    // 1. Verify password server-side
    if (!process.env.UPLOAD_PASSWORD) {
      return { success: false, error: 'Server configuration error: UPLOAD_PASSWORD missing.' };
    }

    if (password !== process.env.UPLOAD_PASSWORD) {
      return { success: false, error: 'Incorrect password.' };
    }

    // 2. Initialize Supabase client
    const supabase = await createClient();
    const filePath = `uploads/${Date.now()}-${filename}`;

    // 3. Create signed upload URL
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to generate upload URL.' };
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}