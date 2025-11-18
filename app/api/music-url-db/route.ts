import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Lấy music file gần nhất
    const { data, error } = await supabase
      .from('music')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ musicUrl: '' })
    }

    if (!data) {
      return NextResponse.json({ musicUrl: '' })
    }

    // Tạo public URL từ storage_path
    const musicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.storage_path}`

    return NextResponse.json({ musicUrl })
  } catch (error) {
    console.error('Error fetching music URL:', error)
    return NextResponse.json({ musicUrl: '' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { musicUrl } = await request.json()

    // Music URL được tạo tự động khi upload via /api/upload
    // Hàm này chỉ dùng để lấy music URL mới nhất

    return NextResponse.json({ 
      success: true,
      message: 'Music should be managed via upload endpoint'
    })
  } catch (error) {
    console.error('Error saving music URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save music URL' },
      { status: 500 }
    )
  }
}
