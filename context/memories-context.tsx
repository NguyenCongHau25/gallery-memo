'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Memory {
  id: string
  imageUrl: string
  title?: string
  date?: string
}

export interface MemoriesContextType {
  memories: Memory[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  addMemory: (memory: Memory) => void
  removeMemory: (id: string) => void
  updateMemory: (id: string, memory: Partial<Memory>) => void
  musicUrl: string
  setMusicUrl: (url: string) => void
  isMusicPlaying: boolean
  setIsMusicPlaying: (playing: boolean) => void
}

const MemoriesContext = createContext<MemoriesContextType | undefined>(undefined)

const DEFAULT_MEMORIES: Memory[] = [
  {
    id: '1',
    imageUrl: '/placeholder.svg?height=1080&width=1920',
    title: 'Mountain Sunset',
    date: '2024-01-15'
  },
  {
    id: '2',
    imageUrl: '/placeholder.svg?height=1080&width=1920',
    title: 'Beach Memories',
    date: '2024-02-20'
  },
  {
    id: '3',
    imageUrl: '/placeholder.svg?height=1080&width=1920',
    title: 'Forest Walk',
    date: '2024-03-10'
  },
  {
    id: '4',
    imageUrl: '/placeholder.svg?height=1080&width=1920',
    title: 'City Lights',
    date: '2024-04-05'
  },
]

export function MemoriesProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(DEFAULT_MEMORIES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [musicUrl, setMusicUrl] = useState('')
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from Supabase on mount and mark as hydrated
  useEffect(() => {
    const loadData = async () => {
      try {
        const [memoriesRes, musicRes] = await Promise.all([
          fetch('/api/memories-db'),
          fetch('/api/music-url-db')
        ])
        
        if (memoriesRes.ok) {
          const data = await memoriesRes.json()
          setMemories(data.memories || DEFAULT_MEMORIES)
        }
        
        if (musicRes.ok) {
          const data = await musicRes.json()
          setMusicUrl(data.musicUrl || '')
        }
      } catch (e) {
        console.error('Failed to load data:', e)
      }
      
      setIsHydrated(true)
    }
    
    loadData()
  }, [])

  // Save memories to Supabase when memories change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      fetch('/api/memories-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories })
      }).catch(e => console.error('Failed to save memories:', e))
    }
  }, [memories, isHydrated])

  // Save music URL to Supabase (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      fetch('/api/music-url-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicUrl })
      }).catch(e => console.error('Failed to save music URL:', e))
    }
  }, [musicUrl, isHydrated])

  const addMemory = (memory: Memory) => {
    setMemories([...memories, memory])
  }

  const removeMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id))
  }

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    setMemories(memories.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  // Only render children after hydration is complete to avoid mismatch
  if (!isHydrated) {
    return (
      <MemoriesContext.Provider
        value={{
          memories,
          currentIndex,
          setCurrentIndex,
          addMemory,
          removeMemory,
          updateMemory,
          musicUrl,
          setMusicUrl,
          isMusicPlaying,
          setIsMusicPlaying,
        }}
      >
        <div suppressHydrationWarning />
      </MemoriesContext.Provider>
    )
  }

  return (
    <MemoriesContext.Provider
      value={{
        memories,
        currentIndex,
        setCurrentIndex,
        addMemory,
        removeMemory,
        updateMemory,
        musicUrl,
        setMusicUrl,
        isMusicPlaying,
        setIsMusicPlaying,
      }}
    >
      {children}
    </MemoriesContext.Provider>
  )
}

export function useMemories() {
  const context = useContext(MemoriesContext)
  if (context === undefined) {
    throw new Error('useMemories must be used within MemoriesProvider')
  }
  return context
}
