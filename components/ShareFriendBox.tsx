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
  const [open, setOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const sharePath = buildSharePath(friendId)
  const shareUrl = buildShareUrl(friendId)

  // Only build the QR image after the user taps Share.
  useEffect(() => {
    if (!open) {
      return
    }

    void QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: compact ? 120 : 220,
    }).then(setQrCodeUrl)
  }, [open, shareUrl, compact])

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div
      className={`share-box${compact ? ' share-box--compact' : ''}${
        open ? ' share-box--open' : ' share-box--closed'
      }`}
    >
      <div className="share-actions">
        <button type="button" onClick={() => setOpen((current) => !current)}>
          {open ? 'Hide share' : 'Share'}
        </button>
      </div>

      {open && (
        <div className="share-panel">
          <p className="share-label">
            {compact ? 'Scan to open friend' : 'Share my friend'}
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
      )}
    </div>
  )
}
