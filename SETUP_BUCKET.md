# Tạo Storage Bucket trong Supabase

## Bước 1: Đăng nhập Supabase Dashboard
- Truy cập: https://app.supabase.com
- Chọn project của bạn

## Bước 2: Tạo Bucket
1. Bên trái menu → **Storage** → **Buckets**
2. Click nút **"Create a new bucket"** (hoặc **+ New bucket**)
3. Điền thông tin:
   - **Bucket name:** `memories` (chính xác như này)
   - **Public bucket:** Tích chọn ✓ (để public cho phép xem ảnh)
4. Click **Create bucket**

## Bước 3: Cấu hình CORS (tuỳ chọn nhưng nên làm)
1. Chọn bucket "memories"
2. Click tab **CORS policies**
3. Nếu chưa có, thêm policy:
```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "allowed_headers": ["*"],
    "max_age": 86400
  }
]
```

## Bước 4: Kiểm tra Credentials
Đảm bảo `.env.local` có:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Bước 5: Test Upload
1. Vào http://localhost:3000/admin/dashboard
2. Click "Add Photos"
3. Chọn ảnh → Click "Save All Photos"
4. Kiểm tra:
   - Dashboard sẽ show upload progress
   - Supabase Storage → memories bucket sẽ có file
   - Database photos table sẽ có metadata

## Nếu vẫn lỗi:
- Kiểm tra Service Role Key đúng (trong upload route)
- Kiểm tra bucket name đúng là "memories"
- Kiểm tra public bucket đã enabled
