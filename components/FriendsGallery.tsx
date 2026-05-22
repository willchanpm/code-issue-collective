'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadAllFriends } from '@/lib/client'
import type { FriendSummary } from '@/lib/types'
import { avatarToDataUrl } from '@/lib/friendUtils'
import { SiteNav } from '@/components/SiteNav'
import { ShareFriendBox } from '@/components/ShareFriendBox'

export function FriendsGallery() {
  const [friends, setFriends] = useState<FriendSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadAllFriends()
      .then((records) => {
        setFriends(records)
        setLoading(false)
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load your friends',
        )
        setLoading(false)
      })
  }, [])

  return (
    <section className="friends-gallery">
      <SiteNav />

      <header className="friends-gallery-header">
        <p className="eyebrow">Your collection</p>
        <h1>All my friends</h1>
        <p className="lede">
          Tap a pocket friend to open their tamagotchi page.
        </p>
      </header>

      {loading && <p className="hint">Loading your friends...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && friends.length === 0 && (
        <div className="friends-empty">
          <p>No friends yet.</p>
          <Link className="button-link" href="/">
            Create your first friend
          </Link>
        </div>
      )}

      {!loading && !error && friends.length > 0 && (
        <ul className="friends-grid">
          {friends.map((friend) => (
            <li key={friend.id}>
              <article className="friend-card">
                <Link className="friend-card-link" href={`/p/${friend.id}`}>
                  <div className="friend-card-screen">
                    <img
                      src={avatarToDataUrl(friend.idleAvatar)}
                      alt={`${friend.name} idle avatar`}
                    />
                  </div>
                  <div className="friend-card-meta">
                    <strong>{friend.name}</strong>
                    <span>{formatCreatedAt(friend.createdAt)}</span>
                  </div>
                </Link>
                <ShareFriendBox friendId={friend.id} compact />
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
