'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { FriendViewState, PipelineStep } from '@/lib/types'
import {
  audioBase64ToUrl,
  processPhotoSerial,
} from '@/lib/client'
import type { FriendRecord, SaveFriendResponse } from '@/lib/types'
import {
  avatarToDataUrl,
  buildShareUrl,
  getAvatarForMood,
} from '@/lib/friendUtils'

type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

const STEP_LABELS: Record<PipelineStep, string> = {
  analyzing: 'Describing your friend...',
  'generating-avatar': 'Generating 8-bit avatar...',
  'generating-voice': 'Creating spoken intro...',
  'generating-music': 'Creating theme music...',
  'generating-sounds': 'Creating button sounds...',
  saving: 'Saving your pocket friend...',
  ready: 'Done!',
}

export function PhotoCapture() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<PipelineStatus>('idle')
  const [step, setStep] = useState<PipelineStep | null>(null)
  const [stepDetail, setStepDetail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [shareInfo, setShareInfo] = useState<SaveFriendResponse | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [result, setResult] = useState<FriendRecord | null>(null)

  useEffect(() => {
    if (!shareInfo) {
      return
    }

    void QRCode.toDataURL(buildShareUrl(shareInfo.id), {
      margin: 1,
      width: 220,
    }).then(setQrCodeUrl)
  }, [shareInfo])

  async function handlePhotoSelected(file: File | undefined) {
    if (!file) {
      return
    }

    setStatus('processing')
    setStep('analyzing')
    setStepDetail(null)
    setError(null)
    setResult(null)
    setShareInfo(null)
    setQrCodeUrl(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const { pipeline, friend } = await processPhotoSerial(file, (nextStep, detail) => {
        setStep(nextStep)
        setStepDetail(detail ?? null)
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

  async function copyShareLink() {
    if (!shareInfo) {
      return
    }

    await navigator.clipboard.writeText(buildShareUrl(shareInfo.id))
  }

  return (
    <section className="capture">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          void handlePhotoSelected(event.target.files?.[0])
        }}
      />

      <button
        type="button"
        disabled={status === 'processing'}
        onClick={() => inputRef.current?.click()}
      >
        {status === 'processing' ? 'Processing photo...' : 'Take polaroid photo'}
      </button>

      {status === 'processing' && step && (
        <p className="hint">
          {STEP_LABELS[step]}
          {stepDetail ? ` (${stepDetail})` : ''}
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {previewUrl && (
        <div className="capture-preview">
          <img src={previewUrl} alt="Captured polaroid preview" />
        </div>
      )}

      {result && shareInfo && (
        <div className="pipeline-result">
          <div className="analysis-card">
            <h2>Meet {result.analysis.nameSuggestion}</h2>
            <p>{result.analysis.description}</p>
            <p className="personality">{result.analysis.personality}</p>
            <blockquote>{result.analysis.narration}</blockquote>

            <div className="share-box">
              <p className="share-label">Friend link for the QR code:</p>
              <a className="share-link" href={shareInfo.sharePath}>
                {buildShareUrl(shareInfo.id)}
              </a>
              <div className="share-actions">
                <button type="button" onClick={() => void copyShareLink()}>
                  Copy link
                </button>
                <a className="button-link" href={shareInfo.sharePath}>
                  Open friend page
                </a>
              </div>
              {qrCodeUrl && (
                <img
                  className="qr-code"
                  src={qrCodeUrl}
                  alt="QR code linking to the friend page"
                />
              )}
            </div>
          </div>

          <FriendPreview friend={result} />
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
      <h3>Preview interactions</h3>
      <div className="friend-stage">
        {currentAvatar && (
          <img
            className="friend-sprite"
            src={avatarToDataUrl(currentAvatar)}
            alt={`${currentAvatar.label} avatar`}
          />
        )}
        <p className="friend-feedback">{feedback}</p>
      </div>

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
