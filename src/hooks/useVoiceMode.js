import { useState, useRef, useCallback } from 'react'
import { useVoiceOutput } from './useVoiceOutput'

export function useVoiceMode({ onSend }) {
  const [voiceModeOn, setVoiceModeOn] = useState(
    () => localStorage.getItem('trico-voice-mode') === 'true'
  )
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const recognitionRef = useRef(null)
  const { isSpeaking, speak, stop } = useVoiceOutput()

  // Start listening after Trico finishes speaking
  const startListening = useCallback(() => {
    setVoiceError(null)

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported. Use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => { setIsListening(true) }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      if (transcript.trim()) {
        onSend(transcript.trim())
      }
    }

    recognition.onerror = (e) => {
      setVoiceError(`Mic error: ${e.error}`)
      setIsListening(false)
    }

    recognition.onend = () => { setIsListening(false) }

    recognitionRef.current = recognition
    recognition.start()
  }, [onSend])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  // Called after every assistant reply
  const handleAssistantReply = useCallback((text) => {
    if (!voiceModeOn) return
    // Speak reply, then auto-listen when done
    speak(text, () => {
      if (voiceModeOn) {
        setTimeout(() => startListening(), 500)
      }
    })
  }, [voiceModeOn, speak, startListening])

  const toggleVoiceMode = useCallback(() => {
    const next = !voiceModeOn
    setVoiceModeOn(next)
    localStorage.setItem('trico-voice-mode', String(next))

    if (!next) {
      stop()
      stopListening()
    } else {
      // Start listening immediately when turned on
      setTimeout(() => startListening(), 300)
    }
  }, [voiceModeOn, stop, stopListening, startListening])

  const stopAll = useCallback(() => {
    stop()
    stopListening()
  }, [stop, stopListening])

  return {
    voiceModeOn,
    isListening,
    isSpeaking,
    voiceError,
    toggleVoiceMode,
    handleAssistantReply,
    startListening,
    stopListening,
    stopAll,
  }
}