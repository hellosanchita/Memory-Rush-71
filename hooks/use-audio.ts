"use client"

import { useCallback, useRef, useState } from "react"

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const initializeAudio = useCallback(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.log("Web Audio API not supported:", error)
      }
    }
  }, [])

  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }, [])

  const playMatchSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return

    // Pleasant ascending chord
    createTone(523.25, 0.2) // C5
    setTimeout(() => createTone(659.25, 0.2), 100) // E5
    setTimeout(() => createTone(783.99, 0.3), 200) // G5
  }, [createTone, isMuted])

  const playLevelCompleteSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return

    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => createTone(freq, 0.4), index * 150)
    })
  }, [createTone, isMuted])

  const playGameOverSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return

    // Descending sad tones
    createTone(392.0, 0.5) // G4
    setTimeout(() => createTone(349.23, 0.5), 300) // F4
    setTimeout(() => createTone(293.66, 0.8), 600) // D4
  }, [createTone, isMuted])

  const playSound = useCallback(
    (soundName: "match" | "levelComplete" | "gameOver") => {
      if (isMuted) return

      switch (soundName) {
        case "match":
          playMatchSound()
          break
        case "levelComplete":
          playLevelCompleteSound()
          break
        case "gameOver":
          playGameOverSound()
          break
      }
    },
    [isMuted, playMatchSound, playLevelCompleteSound, playGameOverSound],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return {
    playSound,
    isMuted,
    toggleMute,
    initializeAudio,
  }
}
