import { createClient } from "@/lib/supabase/server";

export interface MusicMetadata {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  duration?: number;
  uploaded_at: string;
}

export async function getAllMusic(): Promise<MusicMetadata[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("music")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching music:", error);
    return [];
  }

  return data || [];
}

export async function getMusicUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage
    .from("music")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function deleteMusic(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: music, error: fetchError } = await supabase
    .from("music")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !music) {
    console.error("Error fetching music:", fetchError);
    return false;
  }

  const { error: storageError } = await supabase.storage
    .from("music")
    .remove([music.storage_path]);

  if (storageError) {
    console.error("Error deleting from storage:", storageError);
  }

  const { error: dbError } = await supabase
    .from("music")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error("Error deleting music metadata:", dbError);
    return false;
  }

  return true;
}
