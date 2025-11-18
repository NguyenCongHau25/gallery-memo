-- Create tables for media and metadata management

-- Photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music/Audio files table
CREATE TABLE IF NOT EXISTS public.music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slideshow settings table
CREATE TABLE IF NOT EXISTS public.slideshow_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transition_duration INTEGER DEFAULT 5000,
  auto_play BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all for now (admin can restrict later)
CREATE POLICY "Allow public read photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow public read music" ON public.music FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON public.slideshow_settings FOR SELECT USING (true);

-- Create storage bucket for photos (if not exists)
-- Note: Storage buckets are managed via Supabase dashboard or SQL
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('photos', 'photos', true)
-- ON CONFLICT DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('music', 'music', true)
-- ON CONFLICT DO NOTHING;
