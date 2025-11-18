'use client'

import { MemoriesProvider } from '@/context/memories-context'
import { useEffect, useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Suppress hydration warning by not rendering until hydrated
  if (!isHydrated) {
    return <MemoriesProvider>{null}</MemoriesProvider>
  }

  return <MemoriesProvider>{children}</MemoriesProvider>
}
