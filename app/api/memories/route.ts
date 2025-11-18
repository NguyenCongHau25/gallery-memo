import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'memories.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE)
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (e) {
    console.error('Failed to create data directory:', e)
  }
}

export async function GET() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    const memories = JSON.parse(data)
    return NextResponse.json({ memories })
  } catch (e) {
    // Return default if file doesn't exist
    return NextResponse.json({ memories: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    const { memories } = await request.json()
    await fs.writeFile(DATA_FILE, JSON.stringify(memories, null, 2))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Failed to save memories:', e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
