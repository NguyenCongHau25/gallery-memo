import { createClient } from "@/lib/supabase/server";

export interface PhotoMetadata {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_at: string;
}

export async function getAllPhotos(): Promise<PhotoMetadata[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    return [];
  }

  return data || [];
}

export async function getPhotoUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage
    .from("photos")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Get photo metadata to delete from storage
  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !photo) {
    console.error("Error fetching photo:", fetchError);
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("photos")
    .remove([photo.storage_path]);

  if (storageError) {
    console.error("Error deleting from storage:", storageError);
    return false;
  }

  // Delete metadata from database
  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error("Error deleting photo metadata:", dbError);
    return false;
  }

  return true;
}
