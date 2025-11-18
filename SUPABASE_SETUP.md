# Hướng dẫn Cấu hình Supabase

## 1. Tạo Project Supabase

1. Truy cập [app.supabase.com](https://app.supabase.com)
2. Đăng nhập hoặc tạo tài khoản
3. Click "New Project"
4. Chọn region gần nhất (ví dụ: Singapore, Tokyo, etc.)
5. Đặt mật khẩu database
6. Click "Create new project" (chờ 5-10 phút)

## 2. Lấy Credentials

1. Vào **Project Settings** → **API**
2. Copy các giá trị sau:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL trong mục "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Key trong mục "anon public"
   - `SUPABASE_SERVICE_ROLE_KEY` - Key trong mục "service_role secret"

## 3. Cấu hình Environment Variables

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và paste các giá trị:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 4. Sử dụng Schema Hiện Có

Schema Supabase của bạn đã được tạo với 3 bảng chính:

### Bảng photos
```sql
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
```

### Bảng music
```sql
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
```

### Bảng slideshow_settings
```sql
CREATE TABLE IF NOT EXISTS public.slideshow_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transition_duration INTEGER DEFAULT 5000,
  auto_play BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enable RLS Policies

Trong **SQL Editor**, chạy:

```sql
-- Enable RLS cho photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read photos" ON public.photos 
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert photos" ON public.photos 
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow update photos" ON public.photos 
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow delete photos" ON public.photos 
  FOR DELETE USING (true);

-- Enable RLS cho music
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read music" ON public.music 
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert music" ON public.music 
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow update music" ON public.music 
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow delete music" ON public.music 
  FOR DELETE USING (true);

-- Enable RLS cho slideshow_settings
ALTER TABLE public.slideshow_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read settings" ON public.slideshow_settings 
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow write settings" ON public.slideshow_settings 
  FOR INSERT, UPDATE, DELETE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.slideshow_settings TO authenticated, anon;
```

**Schema PostgreSQL chuẩn được sử dụng:**
- `UUID` - ID duy nhất tự động (gen_random_uuid)
- `BIGINT` - Lưu kích thước file lớn
- `TIMESTAMP WITH TIME ZONE` - Timestamps quốc tế
- `DEFAULT NOW()` / `DEFAULT gen_random_uuid()` - Giá trị mặc định tự động
- `UNIQUE` constraint cho filename (không duplicate)
- Các cột `created_at`, `updated_at`, `uploaded_at` để tracking

## 5. Tạo Storage Bucket

1. Vào **Storage** trong Supabase Dashboard
2. Click **Create a new bucket**
3. Đặt tên: `memories`
4. Bỏ check "Private bucket" (để công khai)
5. Click **Create bucket**

### Cấu hình CORS cho bucket

1. Click vào bucket `memories`
2. Vào **Settings** → **CORS**
3. Paste cấu hình:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 6. Khởi động Application

```bash
npm run dev
# hoặc
yarn dev
```

## 7. Kiểm tra Kết nối

1. Truy cập http://localhost:3000/admin
2. Đăng nhập (nếu cần)
3. Thử tải ảnh hoặc âm thanh
4. Kiểm tra Supabase Dashboard:
   - **Table Editor**: Bảng `memories` có dữ liệu
   - **Storage**: Folder `memories` có file ảnh

## Cấu trúc File Upload

```
Supabase Storage (memories bucket)
├── 1731918234_photo1.jpg
├── 1731918235_photo2.jpg
└── 1731918236_music.mp3
```

## Ghi chú quan trọng

- **NEXT_PUBLIC_** prefix: Những biến này PUBLIC, không được lưu secrets
- **SUPABASE_SERVICE_ROLE_KEY**: BẢO MẬT, chỉ server sử dụng
- File ảnh được lưu ở Storage (large binary files)
- Metadata được lưu ở Database (memories table)
- Music file cũng được lưu ở Storage

## Kiến trúc

```
┌─────────────────────┐
│  Next.js Frontend   │
│  (Dashboard)        │
└──────────┬──────────┘
           │
    ┌──────▼──────────┐
    │  API Routes     │
    │ /api/upload     │ ─────────────┐
    │ /api/memories-db│ ─────┐       │
    │ /api/music-db   │      │       │
    └─────────────────┘      │       │
                             │       │
                ┌────────────▼──┐    │
                │   Supabase    │    │
                │   Database    │    │
                │   (metadata)  │    │
                └───────────────┘    │
                                     │
                ┌────────────────────▼─────┐
                │  Supabase Storage       │
                │  (images, music, etc)   │
                └─────────────────────────┘
```

## Troubleshooting

**Lỗi: "SUPABASE_SERVICE_ROLE_KEY not found"**
- Đảm bảo đã copy đầy đủ key vào `.env.local`
- Restart development server

**Lỗi: "Bucket not found"**
- Kiểm tra bucket có tên đúng là `memories` hay không
- Kiểm tra CORS settings

**File upload chậm**
- Bình thường, phụ thuộc vào kích thước file
- Có thể tối ưu bằng cách compress ảnh trước upload

**Data không lưu được**
- Kiểm tra RLS policies đã enable hay chưa
- Xem SQL error trong browser console
