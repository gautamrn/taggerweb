const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const bucketName = process.env.SUPABASE_BUCKET;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const uploadFile = async (file, fileName) => {
  try {
    console.log('Uploading to Supabase bucket:', bucketName);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('File uploaded successfully:', data);

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw new Error('Failed to upload file');
  }
};

const deleteFile = async (fileName) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw new Error('Failed to delete file');
  }
};

module.exports = {
  supabase,
  uploadFile,
  deleteFile
};
