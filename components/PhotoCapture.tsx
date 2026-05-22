'use client'

import { useEffect, useRef, useState } from 'react'
import type { FriendRecord, FriendViewState, SaveFriendResponse } from '@/lib/types'
import {
  audioBase64ToUrl,
  processPhotoSerial,
} from '@/lib/client'
import {
  avatarToDataUrl,
  getAvatarForMood,
} from '@/lib/friendUtils'
import { PipelineProgress } from '@/components/PipelineProgress'
import { ShareFriendBox } from '@/components/ShareFriendBox'
import { TamagotchiShell } from '@/components/TamagotchiShell'
import {
  applyPipelineProgressUpdate,
  createInitialPipelineProgress,
  type PipelineProgressState,
} from '@/lib/pipelineProgress'

type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

// Laptops/desktops use the webcam; phones keep the native camera file picker.
function prefersWebcamCapture(): boolean {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false
  }

  const isMobile = window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches
  return !isMobile
}

export function PhotoCapture() {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<PipelineStatus>('idle')
  const [showWebcam, setShowWebcam] = useState(false)
  const [useWebcam, setUseWebcam] = useState(false)
  const [progress, setProgress] = useState<PipelineProgressState>(
    createInitialPipelineProgress,
  )
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [shareInfo, setShareInfo] = useState<SaveFriendResponse | null>(null)
  const [result, setResult] = useState<FriendRecord | null>(null)

  useEffect(() => {
    setUseWebcam(prefersWebcamCapture())
  }, [])

  // Turn on the live webcam preview once the modal is visible.
  useEffect(() => {
    if (!showWebcam || !videoRef.current || !streamRef.current) {
      return
    }

    videoRef.current.srcObject = streamRef.current
    void videoRef.current.play()
  }, [showWebcam])

  // Always stop the camera when leaving the page or closing the modal.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  function stopWebcam() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setShowWebcam(false)
  }

  async function openWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setShowWebcam(true)
      setError(null)
    } catch {
      // If the user blocks the camera, fall back to uploading a file instead.
      inputRef.current?.click()
    }
  }

  async function captureFromWebcam() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) {
      setError('Webcam is not ready yet. Try again in a second.')
      return
    }

    // Grab one frame from the live video and turn it into a photo file.
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) {
      setError('Could not capture from webcam.')
      return
    }

    context.drawImage(video, 0, 0)
    stopWebcam()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    })

    if (!blob) {
      setError('Could not save the webcam photo.')
      return
    }

    const file = new File([blob], `polaroid-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })

    void handlePhotoSelected(file)
  }

  function handleTakePhotoClick() {
    if (status === 'processing') {
      return
    }

    if (useWebcam) {
      void openWebcam()
      return
    }

    inputRef.current?.click()
  }

  function handleUploadClick() {
    if (status === 'processing') {
      return
    }

    inputRef.current?.click()
  }

  async function handlePhotoSelected(file: File | undefined) {
    if (!file) {
      return
    }

    setStatus('processing')
    setProgress(createInitialPipelineProgress())
    setError(null)
    setResult(null)
    setShareInfo(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const { pipeline, friend } = await processPhotoSerial(file, (update) => {
        setProgress((current) => applyPipelineProgressUpdate(current, update))
      })

      setShareInfo(friend)
      setResult({
        id: friend.id,
        createdAt: new Date().toISOString(),
        ...pipeline,
      })
      setStatus('ready')
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while processing the photo'
      setError(message)
      setStatus('error')
    }
  }

  return (
    <section className="capture">
      {/* Empty device before a photo is taken; live device once processing finishes. */}
      {status !== 'ready' && (
        <div className="capture-device">
          <TamagotchiShell empty />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          void handlePhotoSelected(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div className="capture-actions">
        <button
          type="button"
          disabled={status === 'processing' || showWebcam}
          onClick={handleTakePhotoClick}
        >
          {status === 'processing'
            ? 'Processing photo...'
            : useWebcam
              ? 'Take photo with webcam'
              : 'Take polaroid photo'}
        </button>

        {useWebcam && (
          <button
            type="button"
            className="capture-secondary"
            disabled={status === 'processing' || showWebcam}
            onClick={handleUploadClick}
          >
            Upload photo instead
          </button>
        )}
      </div>

      {showWebcam && (
        <div className="webcam-capture">
          <p className="hint">Hold your polaroid up to the webcam, then capture.</p>
          <video
            ref={videoRef}
            className="webcam-video"
            playsInline
            muted
            autoPlay
          />
          <div className="webcam-actions">
            <button type="button" onClick={() => void captureFromWebcam()}>
              Capture photo
            </button>
            <button type="button" className="capture-secondary" onClick={stopWebcam}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'processing' && <PipelineProgress progress={progress} />}

      {error && <p className="error">{error}</p>}

      {previewUrl && status !== 'ready' && (
        <div className="capture-preview">
          <img src={previewUrl} alt="Captured polaroid preview" />
        </div>
      )}

      {result && shareInfo && (
        <div className="pipeline-result">
          <div className="capture-device">
            <FriendPreview friend={result} />
          </div>

          <div className="analysis-card">
            <h2>Meet {result.analysis.nameSuggestion}</h2>
            <p>{result.analysis.description}</p>
            <p className="personality">{result.analysis.personality}</p>
            <blockquote>{result.analysis.narration}</blockquote>

            <div className="share-box-wrap">
              {shareInfo && <ShareFriendBox friendId={shareInfo.id} />}
              <div className="share-actions">
                <a className="button-link" href="/friends">
                  See all my friends
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function FriendPreview({ friend }: { friend: FriendRecord }) {
  const [viewState, setViewState] = useState<FriendViewState>('idle')
  const [feedback, setFeedback] = useState('Tap a button to interact.')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentAvatar = getAvatarForMood(friend, viewState) ?? friend.avatars[0]

  function playAudio(audio?: { audioBase64: string; mimeType: string }) {
    if (!audio || !audioRef.current) {
      return
    }

    audioRef.current.src = audioBase64ToUrl(audio)
    void audioRef.current.play()
  }

  return (
    <div className="friend-preview">
      <TamagotchiShell
        spriteSrc={currentAvatar ? avatarToDataUrl(currentAvatar) : undefined}
        spriteAlt={currentAvatar ? `${currentAvatar.label} avatar` : undefined}
        feedback={feedback}
        name={friend.analysis.nameSuggestion.toUpperCase()}
      />

      <div className="friend-actions">
        <button
          type="button"
          onClick={() => {
            setViewState('idle')
            setFeedback(resultMessage('message'))
            playAudio(friend.narrationAudio ?? friend.actionSounds?.idle)
          }}
        >
          Tap / Message
        </button>
        <button
          type="button"
          onClick={() => {
            setViewState('pint')
            setFeedback('Cheers!')
            playAudio(friend.actionSounds?.pint)
          }}
        >
          Pint Beer
        </button>
        <button
          type="button"
          onClick={() => {
            setViewState('dance')
            setFeedback("Let's dance!")
            playAudio(friend.actionSounds?.dance ?? friend.themeMusic)
          }}
        >
          Dance
        </button>
      </div>

      <audio ref={audioRef} hidden />
    </div>
  )
}

function resultMessage(action: 'message'): string {
  return action === 'message' ? 'Hey, it is good to see you!' : ''
}
