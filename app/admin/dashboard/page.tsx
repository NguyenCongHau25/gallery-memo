'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/admin/dashboard'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const isAuthed = sessionStorage.getItem('adminAuth')
    if (!isAuthed) {
      router.push('/admin')
    }
  }, [router])

  return <Dashboard />
}
