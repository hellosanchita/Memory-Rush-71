"use client"

import { useCallback, useRef, useState, useEffect } from "react"

export type BackgroundMusicType = "ambient" | "electronic" | "nature" | "classical" | "upbeat"

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false)
  const [isMusicMuted, setIsMusicMuted] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [currentMusicType, setCurrentMusicType] = useState<BackgroundMusicType>("ambient")
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load music preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMusicType = localStorage.getItem("memoryRushMusicType") as BackgroundMusicType
      if (savedMusicType) {
        setCurrentMusicType(savedMusicType)
      }
    }
  }, [])

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

  const createChord = useCallback((frequencies: number[], duration: number, volume = 0.05) => {
    if (!audioContextRef.current) return

    frequencies.forEach((freq) => {
      const oscillator = audioContextRef.current!.createOscillator()
      const gainNode = audioContextRef.current!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current!.destination)

      oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContextRef.current!.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current!.currentTime + 0.5)
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + duration)

      oscillator.start(audioContextRef.current!.currentTime)
      oscillator.stop(audioContextRef.current!.currentTime + duration)
    })
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

  // Different background music patterns
  const playAmbientMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicMuted) return
    const frequencies = [220, 246.94, 293.66, 329.63] // A3, B3, D4, E4
    const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)]
    createChord([randomFreq, randomFreq * 1.5], 4, 0.03)
  }, [createChord, isMusicMuted])

  const playElectronicMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicMuted) return
    const bassFreqs = [110, 123.47, 146.83] // A2, B2, D3
    const leadFreqs = [440, 493.88, 587.33] // A4, B4, D5
    const bass = bassFreqs[Math.floor(Math.random() * bassFreqs.length)]
    const lead = leadFreqs[Math.floor(Math.random() * leadFreqs.length)]

    // Bass line
    createChord([bass], 2, 0.04)
    // Lead melody
    setTimeout(() => createChord([lead], 1.5, 0.02), 500)
  }, [createChord, isMusicMuted])

  const playNatureMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicMuted) return
    // Pentatonic scale for peaceful nature sounds
    const frequencies = [261.63, 293.66, 329.63, 392.0, 440] // C4, D4, E4, G4, A4
    const chord = [
      frequencies[Math.floor(Math.random() * frequencies.length)],
      frequencies[Math.floor(Math.random() * frequencies.length)],
    ]
    createChord(chord, 5, 0.025)
  }, [createChord, isMusicMuted])

  const playClassicalMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicMuted) return
    // Classical chord progressions
    const chords = [
      [261.63, 329.63, 392.0], // C major
      [293.66, 369.99, 440], // D minor
      [329.63, 415.3, 493.88], // E minor
      [349.23, 440, 523.25], // F major
    ]
    const randomChord = chords[Math.floor(Math.random() * chords.length)]
    createChord(randomChord, 3.5, 0.03)
  }, [createChord, isMusicMuted])

  const playUpbeatMusic = useCallback(() => {
    if (!audioContextRef.current || isMusicMuted) return
    // Energetic major chords
    const upbeatChords = [
      [523.25, 659.25, 783.99], // C5 major
      [587.33, 739.99, 880], // D5 major
      [659.25, 830.61, 987.77], // E5 major
    ]
    const chord = upbeatChords[Math.floor(Math.random() * upbeatChords.length)]
    createChord(chord, 2.5, 0.04)

    // Add rhythmic element
    setTimeout(() => {
      createChord([chord[0] / 2], 1, 0.03) // Bass note
    }, 1000)
  }, [createChord, isMusicMuted])

  const getMusicPlayer = useCallback(() => {
    switch (currentMusicType) {
      case "electronic":
        return playElectronicMusic
      case "nature":
        return playNatureMusic
      case "classical":
        return playClassicalMusic
      case "upbeat":
        return playUpbeatMusic
      default:
        return playAmbientMusic
    }
  }, [currentMusicType, playAmbientMusic, playElectronicMusic, playNatureMusic, playClassicalMusic, playUpbeatMusic])

  const getMusicInterval = useCallback(() => {
    switch (currentMusicType) {
      case "electronic":
        return 3000 + Math.random() * 2000 // 3-5 seconds
      case "nature":
        return 6000 + Math.random() * 4000 // 6-10 seconds
      case "classical":
        return 4000 + Math.random() * 3000 // 4-7 seconds
      case "upbeat":
        return 2500 + Math.random() * 1500 // 2.5-4 seconds
      default:
        return 5000 + Math.random() * 3000 // 5-8 seconds (ambient)
    }
  }, [currentMusicType])

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

  const startBackgroundMusic = useCallback(() => {
    if (isMusicMuted || musicIntervalRef.current) return

    const musicPlayer = getMusicPlayer()

    const playRandomMusic = () => {
      musicPlayer()
      const nextDelay = getMusicInterval()
      musicIntervalRef.current = setTimeout(playRandomMusic, nextDelay)
    }

    playRandomMusic()
    setIsMusicPlaying(true)
  }, [isMusicMuted, getMusicPlayer, getMusicInterval])

  const stopBackgroundMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current)
      musicIntervalRef.current = null
    }
    setIsMusicPlaying(false)
  }, [])

  const changeMusicType = useCallback(
    (newType: BackgroundMusicType) => {
      setCurrentMusicType(newType)

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("memoryRushMusicType", newType)
      }

      // Restart music with new type if currently playing
      if (isMusicPlaying) {
        stopBackgroundMusic()
        setTimeout(() => {
          startBackgroundMusic()
        }, 500)
      }
    },
    [isMusicPlaying, startBackgroundMusic, stopBackgroundMusic],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const toggleMusicMute = useCallback(() => {
    setIsMusicMuted((prev) => {
      const newMuted = !prev
      if (newMuted) {
        stopBackgroundMusic()
      } else if (!newMuted && !isMusicPlaying) {
        startBackgroundMusic()
      }
      return newMuted
    })
  }, [isMusicPlaying, startBackgroundMusic, stopBackgroundMusic])

  return {
    playSound,
    isMuted,
    toggleMute,
    isMusicMuted,
    toggleMusicMute,
    startBackgroundMusic,
    stopBackgroundMusic,
    isMusicPlaying,
    initializeAudio,
    currentMusicType,
    changeMusicType,
  }
}
