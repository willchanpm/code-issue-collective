'use client'

import { useEffect, useRef, useState } from 'react'
import type { FriendRecord, FriendViewState } from '@/lib/types'
import { loadFriend } from '@/lib/client'
import { audioBase64ToUrl } from '@/lib/client'
import {
  avatarToDataUrl,
  getAvatarForMood,
} from '@/lib/friendUtils'
import { TamagotchiShell } from '@/components/TamagotchiShell'

export function FriendViewer({ id }: { id: string }) {
  const [friend, setFriend] = useState<FriendRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewState, setViewState] = useState<FriendViewState>('idle')
  const [feedback, setFeedback] = useState('Tap a button to say hi.')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    void loadFriend(id)
      .then((record) => {
        setFriend(record)
        setLoading(false)
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load this friend',
        )
        setLoading(false)
      })
  }, [id])

  function playAudio(audio?: { audioBase64: string; mimeType: string }) {
    if (!audio || !audioRef.current) {
      return
    }

    audioRef.current.src = audioBase64ToUrl(audio)
    void audioRef.current.play()
  }

  if (loading) {
    return <p className="hint">Loading your pocket friend...</p>
  }

  if (error || !friend) {
    return <p className="error">{error ?? 'Friend not found'}</p>
  }

  const currentAvatar = getAvatarForMood(friend, viewState) ?? friend.avatars[0]

  return (
    <section className="friend-page">
      <header className="friend-header">
        <p className="eyebrow">Pocket friend</p>
        <h1>{friend.analysis.nameSuggestion}</h1>
        <p className="lede">{friend.analysis.personality}</p>
      </header>

      <div className="capture-device">
        <TamagotchiShell
          spriteSrc={currentAvatar ? avatarToDataUrl(currentAvatar) : undefined}
          spriteAlt={currentAvatar ? `${currentAvatar.label} avatar` : undefined}
          feedback={feedback}
          name={friend.analysis.nameSuggestion.toUpperCase()}
        />
      </div>

      <div className="friend-actions">
        <button
          type="button"
          onClick={() => {
            setViewState('idle')
            setFeedback('Hey, it is good to see you!')
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
    </section>
  )
}
