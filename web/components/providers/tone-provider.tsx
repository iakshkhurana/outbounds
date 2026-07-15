'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Tone } from '@/lib/types'

interface ToneContextType {
  tone: Tone
  setTone: (tone: Tone) => void
}

const ToneContext = createContext<ToneContextType | undefined>(undefined)

export function ToneProvider({ children }: { children: ReactNode }) {
  const [tone, setToneState] = useState<Tone>('serious')

  useEffect(() => {
    const saved = localStorage.getItem('outbounds-tone') as Tone | null
    if (saved === 'serious' || saved === 'story') {
      setToneState(saved)
    }
  }, [])

  const setTone = (next: Tone) => {
    setToneState(next)
    localStorage.setItem('outbounds-tone', next)
  }

  return (
    <ToneContext.Provider value={{ tone, setTone }}>{children}</ToneContext.Provider>
  )
}

export function useTone() {
  const context = useContext(ToneContext)
  if (!context) {
    throw new Error('useTone must be used within ToneProvider')
  }
  return context
}
