import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'photo' | 'music' // 'photo' or 'music'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Use service role for server-side operations (bypass RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const fileName = `${Date.now()}_${file.name}`
    const bucketName = 'memories' // Same bucket for both photos and music

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Check if bucket doesn't exist
      if ((uploadError as any).statusCode === '404') {
        return NextResponse.json(
          { 
            error: 'Storage bucket "memories" not found. Please create it in Supabase Dashboard → Storage → Create bucket',
            details: uploadError.message 
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    // Save metadata to database based on type
    if (type === 'photo') {
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          filename: fileName,
          original_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: `${bucketName}/${fileName}`,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: dbError.message },
          { status: 500 }
        )
      }
    } else if (type === 'music') {
      const { error: dbError } = await supabase
        .from('music')
        .insert({
          filename: fileName,
          original_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: `${bucketName}/${fileName}`,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: dbError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
