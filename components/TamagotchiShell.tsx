// The pink tamagotchi device frame that wraps the 8-bit character sprite.
type TamagotchiShellProps = {
  spriteSrc?: string
  spriteAlt?: string
  feedback?: string
  name?: string
  // When true, show the empty "waiting for a friend" placeholder screen.
  empty?: boolean
}

export function TamagotchiShell({
  spriteSrc,
  spriteAlt,
  feedback,
  name,
  empty = false,
}: TamagotchiShellProps) {
  return (
    <div className={`tamagotchi-shell${empty ? '' : ' tamagotchi-shell--live'}`}>
      <div className="tamagotchi-shell-top">
        <span className="tamagotchi-brand">TAMAGOTCHA</span>
      </div>

      <div className="tamagotchi-screen">
        <div className="tamagotchi-status">
          <span>{empty ? 'HUNGRY' : name ?? 'FRIEND'}</span>
          <strong>{empty ? '♥ ♥ ♡' : '♥ ♥ ♥'}</strong>
        </div>

        <div className="tamagotchi-viewport">
          {spriteSrc ? (
            <img
              className="tamagotchi-sprite"
              src={spriteSrc}
              alt={spriteAlt ?? 'Pocket friend sprite'}
            />
          ) : (
            <div className="tamagotchi-placeholder">
              <span>?</span>
              <p>{empty ? 'Snap a photo to hatch your friend' : 'Loading...'}</p>
            </div>
          )}
        </div>

        {feedback && <p className="tamagotchi-feedback">{feedback}</p>}
      </div>

      <div className="tamagotchi-buttons" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
