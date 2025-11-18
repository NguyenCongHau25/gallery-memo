import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface Memory {
  id: string
  imageUrl: string
  title?: string
  date?: string
}

// Map từ photos table sang Memory format
async function getMemoriesFromPhotos(supabase: any): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Database error:', error)
    return []
  }

  return (data || []).map((photo: any) => ({
    id: photo.id,
    imageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.storage_path}`,
    title: photo.original_name.split('.')[0], // Lấy tên file không extension
    date: photo.created_at?.split('T')[0], // Lấy date từ created_at
  }))
}

export async function GET() {
  try {
    const supabase = await createClient()
    const memories = await getMemoriesFromPhotos(supabase)
    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ memories: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { memories } = await request.json()

    // Xóa photos cũ
    await supabase.from('photos').delete().neq('id', '')

    // Note: Không thể insert directly vì photos table có UUID auto-generate
    // Thực tế photos được tạo qua upload route
    // Hàm này chỉ đọc từ database
    
    return NextResponse.json({ 
      success: true, 
      message: 'Memories should be managed via upload endpoint'
    })
  } catch (error) {
    console.error('Error saving memories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save memories' },
      { status: 500 }
    )
  }
}
