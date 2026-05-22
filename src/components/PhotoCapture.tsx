import { useRef, useState } from 'react'
import type { TamagotchaPipelineResult } from '../../shared/types.ts'
import { audioBase64ToUrl, processPhoto } from '../api/client.ts'

type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

export function PhotoCapture() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<PipelineStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<TamagotchaPipelineResult | null>(null)

  async function handlePhotoSelected(file: File | undefined) {
    if (!file) {
      return
    }

    setStatus('processing')
    setError(null)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const pipelineResult = await processPhoto(file)
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

      <button type="button" onClick={() => inputRef.current?.click()}>
        {status === 'processing' ? 'Processing photo...' : 'Take polaroid photo'}
      </button>

      {status === 'processing' && (
        <p className="hint">Describing your friend and generating 8-bit avatars...</p>
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
