'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { buildSharePath, buildShareUrl } from '@/lib/friendUtils'

type ShareFriendBoxProps = {
  friendId: string
  // Smaller QR for the friends grid cards.
  compact?: boolean
}

export function ShareFriendBox({ friendId, compact = false }: ShareFriendBoxProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const sharePath = buildSharePath(friendId)
  const shareUrl = buildShareUrl(friendId)

  // Build the QR image whenever this friend id is shown.
  useEffect(() => {
    void QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: compact ? 120 : 220,
    }).then(setQrCodeUrl)
  }, [shareUrl, compact])

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className={`share-box${compact ? ' share-box--compact' : ''}`}>
      <p className="share-label">
        {compact ? 'Share QR' : 'Share my friend'}
      </p>

      {qrCodeUrl && (
        <img
          className="qr-code"
          src={qrCodeUrl}
          alt={`QR code linking to ${shareUrl}`}
        />
      )}

      {!compact && (
        <a className="share-link" href={sharePath}>
          {shareUrl}
        </a>
      )}

      <div className="share-actions">
        <button type="button" onClick={() => void copyShareLink()}>
          Copy link
        </button>
        {!compact && (
          <a className="button-link" href={sharePath}>
            Open friend page
          </a>
        )}
      </div>
    </div>
  )
}
