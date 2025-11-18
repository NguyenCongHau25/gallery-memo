'use client'

import { useEffect, useRef, useState } from 'react'
import { useMemories } from '@/context/memories-context'
import Image from 'next/image'
import { LeftOutlined, RightOutlined, AudioOutlined, AudioMutedOutlined, SettingOutlined, PauseOutlined } from '@ant-design/icons'
import Link from 'next/link'

const SLIDE_DURATION = 5000 // 5 seconds per slide

export default function Slideshow() {
  const { memories, currentIndex, setCurrentIndex, musicUrl, isMusicPlaying, setIsMusicPlaying } = useMemories()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [autoPlay, setAutoPlay] = useState(true)

  const currentMemory = memories[currentIndex]

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoPlay || memories.length === 0) return

    const timer = setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % memories.length)
    }, SLIDE_DURATION)

    return () => clearTimeout(timer)
  }, [currentIndex, autoPlay, memories.length, setCurrentIndex])

  // Handle music playback
  useEffect(() => {
    if (audioRef.current && musicUrl) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => {
          console.log('Autoplay prevented:', e)
          setIsMusicPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isMusicPlaying, musicUrl, setIsMusicPlaying])

  const handlePrevious = () => {
    setAutoPlay(false)
    setCurrentIndex((currentIndex - 1 + memories.length) % memories.length)
  }

  const handleNext = () => {
    setAutoPlay(false)
    setCurrentIndex((currentIndex + 1) % memories.length)
  }

  const toggleMusic = () => {
    if (musicUrl) {
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay)
  }

  if (memories.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-foreground mb-4">No Memories Yet</h1>
          <p className="text-muted-foreground mb-8">Start by adding photos in the admin panel</p>
          <Link href="/admin">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Go to Admin Panel
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Main Slideshow */}
      <div className="relative w-full h-full">
        {memories.map((memory, index) => (
          <div
            key={memory.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={memory.imageUrl || "/placeholder.svg"}
              alt={memory.title || 'Memory'}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-serif text-white font-light tracking-tight">Memories 12.9 NH2023-2025</h1>
            {/* <p className="text-white/60 text-sm mt-2 font-light">a collection of moments</p> */}
          </div>
          <Link href="/admin" className="pointer-events-auto">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <SettingOutlined className="text-white text-lg" />
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-6">
          {/* Current Photo Info */}
          {/* <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h2 className="text-2xl font-serif text-white font-light">{currentMemory.title || 'Untitled'}</h2>
            {currentMemory.date && (
              <p className="text-white/60 text-sm mt-2 font-light">{new Date(currentMemory.date).toLocaleDateString()}</p>
            )}
          </div> */}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pointer-events-auto">
            {/* Left Controls - Previous/Next */}
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Previous slide"
              >
                <LeftOutlined className="text-white text-lg" />
              </button>

            <button
                onClick={toggleAutoPlay}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Toggle autoplay"
              >
                {autoPlay ? (
                  <PauseOutlined className="text-white text-lg" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white text-lg inline"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Next slide"
              >
                <RightOutlined className="text-white text-lg" />
              </button>
            </div>

            {/* Center Controls - Slide Counter and AutoPlay */}
            <div className="flex items-center gap-6">
              {/* Slide Counter */}
              <div className="text-white/60 text-sm font-light">
                {currentIndex + 1} / {memories.length}
              </div>

              {/* AutoPlay Toggle */}
              
            </div>

            {/* Right Controls - Music */}
            <button
              onClick={toggleMusic}
              disabled={!musicUrl}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Toggle music"
            >
              {isMusicPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white text-lg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
                  <path d="M16.5 8.5a4.5 4.5 0 010 7" stroke="currentColor" fill="none" />
                  <path d="M19 5a8 8 0 010 14" stroke="currentColor" fill="none" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white text-lg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
                  <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop />
      )}

      {/* Progress Indicators */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-white/40 transition-all duration-300"
          style={{
            width: `${(currentIndex / (memories.length - 1 || 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
