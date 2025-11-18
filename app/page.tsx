'use client'

import { useState, useEffect } from 'react'
import Slideshow from '@/components/slideshow'
import { MemoriesProvider } from '@/context/memories-context'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <MemoriesProvider>
      <main className="w-full h-screen bg-background">
        <Slideshow />
      </main>
    </MemoriesProvider>
  )
}
