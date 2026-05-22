'use client'

import { useRef, useState } from 'react'
import type { PipelineStep, TamagotchaPipelineResult } from '@/lib/types'
import { audioBase64ToUrl, processPhotoSerial } from '@/lib/client'

type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

const STEP_LABELS: Record<PipelineStep, string> = {
  analyzing: 'Describing your friend...',
  'generating-avatar': 'Generating 8-bit avatar...',
  'generating-voice': 'Creating spoken intro...',
  'generating-music': 'Creating theme music...',
  ready: 'Done!',
}

export function PhotoCapture() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<PipelineStatus>('idle')
  const [step, setStep] = useState<PipelineStep | null>(null)
  const [stepDetail, setStepDetail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<TamagotchaPipelineResult | null>(null)

  async function handlePhotoSelected(file: File | undefined) {
    if (!file) {
      return
    }

    setStatus('processing')
    setStep('analyzing')
    setStepDetail(null)
    setError(null)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const pipelineResult = await processPhotoSerial(file, (nextStep, detail) => {
        setStep(nextStep)
        setStepDetail(detail ?? null)
      })
      setResult(pipelineResult)
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

      {result && (
        <div className="pipeline-result">
          <div className="analysis-card">
            <h2>Meet {result.analysis.nameSuggestion}</h2>
            <p>{result.analysis.description}</p>
            <p className="personality">{result.analysis.personality}</p>
            <blockquote>{result.analysis.narration}</blockquote>

            {result.narrationAudio && (
              <audio controls src={audioBase64ToUrl(result.narrationAudio)}>
                Your browser does not support audio playback.
              </audio>
            )}
          </div>

          <div className="avatar-grid">
            {result.avatars.map((avatar) => (
              <figure key={avatar.mood}>
                <img
                  src={`data:${avatar.mimeType};base64,${avatar.imageBase64}`}
                  alt={`${avatar.label} avatar`}
                />
                <figcaption>{avatar.label}</figcaption>
              </figure>
            ))}
          </div>

          {result.themeMusic && (
            <div className="music-player">
              <p>Pet theme music</p>
              <audio controls src={audioBase64ToUrl(result.themeMusic)}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
