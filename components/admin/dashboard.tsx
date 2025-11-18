'use client'

import { useState, useRef } from 'react'
import { useMemories } from '@/context/memories-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DeleteOutlined, PlusOutlined, LogoutOutlined, AudioOutlined, FolderOutlined } from '@ant-design/icons'

interface ImagePreview {
  url: string
  title: string
  date: string
  fileName: string
  file?: File
  originalSize?: number
  compressedSize?: number
}

// Hàm nén ảnh để tiết kiệm dung lượng
const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            quality
          )
        } else {
          resolve(file)
        }
      }
    }
  })
}

export default function Dashboard() {
  const { memories, addMemory, removeMemory, updateMemory, musicUrl, setMusicUrl } = useMemories()
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [currentEditIndex, setCurrentEditIndex] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [newMusicUrl, setNewMusicUrl] = useState(musicUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAddMemories = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      for (let i = 0; i < imagePreviews.length; i++) {
        const preview = imagePreviews[i]
        
        if (!preview.file) {
          throw new Error(`No file for preview ${i}`)
        }

        // Tạo FormData để gửi file
        const formData = new FormData()
        formData.append('file', preview.file)
        formData.append('type', 'photo')

        // Gửi lên Supabase
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Thêm vào context sau khi upload thành công
        const memory = {
          id: data.fileName || (Date.now().toString() + Math.random()),
          imageUrl: data.url,
          title: preview.title || preview.fileName.split('.')[0] || 'Untitled',
          date: preview.date || new Date().toISOString().split('T')[0],
        }
        addMemory(memory)

        setUploadProgress(i + 1)
      }

      // Xóa preview sau khi upload thành công
      setImagePreviews([])
      setCurrentEditIndex(0)
      setLoadingProgress(0)
      setTotalFiles(0)
      setUploadProgress(0)
      alert('Tất cả ảnh đã được tải lên thành công!')
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Lỗi khi tải ảnh: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploading(false)
    }
  }

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/')
  }

  const processImageFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter(isImageFile)
    setTotalFiles(imageFiles.length)
    setLoadingProgress(0)

    let loadedCount = 0

    imageFiles.forEach((file) => {
      // Nén ảnh trước
      compressImage(file, 0.7).then((compressedFile) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newPreview: ImagePreview = {
            url: reader.result as string,
            title: '',
            date: new Date().toISOString().split('T')[0],
            fileName: file.name,
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
          }
          setImagePreviews((prev) => [...prev, newPreview])
          loadedCount++
          setLoadingProgress(loadedCount)
        }
        reader.readAsDataURL(compressedFile)
      })
    })
  }

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processImageFiles(files)
  }

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processImageFiles(files)
  }

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'music')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        setNewMusicUrl(data.url)
        setMusicUrl(data.url)
        alert('Nhạc đã được tải lên thành công!')
      } catch (error) {
        console.error('Error uploading music:', error)
        alert('Lỗi khi tải nhạc: ' + (error instanceof Error ? error.message : 'Unknown error'))
      } finally {
        setIsUploading(false)
      }
    }
  }

  const updateImagePreview = (index: number, field: 'title' | 'date', value: string) => {
    const updated = [...imagePreviews]
    updated[index] = { ...updated[index], [field]: value }
    setImagePreviews(updated)
  }

  const removeImagePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    if (currentEditIndex >= imagePreviews.length - 1 && currentEditIndex > 0) {
      setCurrentEditIndex(currentEditIndex - 1)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  const currentPreview = imagePreviews[currentEditIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif text-foreground font-light">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <LogoutOutlined className="text-lg" />
            Logout
          </button>
        </div>

        {/* Quick Actions - Top Right */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Add Photos Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusOutlined className="text-lg" />
            Add Photos
          </button>

          {/* Add Folder Button */}
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <FolderOutlined className="text-lg" />
            Add Folder
          </button>

          {/* Add Music Button */}
          <button
            onClick={() => musicInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity col-span-2"
          >
            <AudioOutlined className="text-lg" />
            Add Music
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMultipleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            className="hidden"
            {...({ webkitdirectory: '', mozdirectory: '' } as any)}
          />
          <input
            type="file"
            ref={musicInputRef}
            onChange={handleMusicUpload}
            accept="audio/*"
            className="hidden"
          />
        </div>

        {/* Loading Progress */}
        {totalFiles > 0 && loadingProgress < totalFiles && (
          <div className="bg-card border border-border rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Loading photos...</p>
              <p className="text-sm text-muted-foreground">{loadingProgress} / {totalFiles}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loadingProgress / totalFiles) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && imagePreviews.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Uploading to Supabase...</p>
              <p className="text-sm text-muted-foreground">{uploadProgress} / {imagePreviews.length}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress / imagePreviews.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Music Status */}
        {musicUrl && (
          <div className="bg-card border border-border rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <AudioOutlined className="text-lg text-primary" />
              <p className="text-sm text-muted-foreground">Music file loaded ✓</p>
            </div>
          </div>
        )}

        {/* Add Photos Form */}
        {imagePreviews.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Edit Photos ({imagePreviews.length})</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preview List */}
              <div className="lg:col-span-1">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {imagePreviews.map((preview, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEditIndex(index)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                        currentEditIndex === index
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {preview.title || preview.fileName || `Photo ${index + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{preview.date}</p>
                          {preview.originalSize && preview.compressedSize && (
                            <p className="text-xs text-green-600">
                              {(preview.compressedSize / 1024 / 1024).toFixed(2)}MB
                              <span className="text-muted-foreground"> (từ {(preview.originalSize / 1024 / 1024).toFixed(2)}MB)</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Form */}
              {currentPreview && (
                <form onSubmit={handleAddMemories} className="lg:col-span-2 space-y-4">
                  {/* Image Preview */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Preview
                    </label>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={currentPreview.url}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                      Title (optional)
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={currentPreview.title}
                      onChange={(e) => updateImagePreview(currentEditIndex, 'title', e.target.value)}
                      placeholder="e.g., Summer Vacation"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                      Date (optional)
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={currentPreview.date}
                      onChange={(e) => updateImagePreview(currentEditIndex, 'date', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? `Uploading... (${uploadProgress}/${imagePreviews.length})` : 'Save All Photos'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImagePreview(currentEditIndex)}
                      disabled={isUploading}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DeleteOutlined className="text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreviews([])}
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel All
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Memories Grid */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-serif text-foreground font-light mb-4">Your Memories ({memories.length})</h2>
          {memories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-light">No memories yet. Add your first photos!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map((memory) => (
                <div key={memory.id} className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-colors">
                  <img
                    src={memory.imageUrl || "/placeholder.svg"}
                    alt={memory.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeMemory(memory.id)}
                      className="p-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <DeleteOutlined className="text-lg" />
                    </button>
                  </div>
                  <div className="p-3 bg-muted/80">
                    <p className="font-medium text-foreground text-sm truncate">{memory.title}</p>
                    {memory.date && (
                      <p className="text-xs text-muted-foreground">{new Date(memory.date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
