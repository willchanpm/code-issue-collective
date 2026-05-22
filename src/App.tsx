import './App.css'

function App() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Polaroid-powered pet simulator</p>
        <h1>Tamagotcha</h1>
        <p className="lede">
          Snap a photo of a polaroid of your friend and we&apos;ll turn them into
          an interactive tamagotchi you can feed, play with, and keep alive.
        </p>
      </header>

      <section className="polaroid-stage" aria-label="Polaroid preview">
        {/* Placeholder frame for the future photo-to-pet flow. */}
        <div className="polaroid">
          <div className="polaroid-photo">
            <span className="face" aria-hidden="true">
              :)
            </span>
            <p>Your friend goes here</p>
          </div>
          <p className="polaroid-caption">Bestie loading...</p>
        </div>

        <div className="pet-shell" aria-hidden="true">
          <div className="pet-screen">
            <span>HUNGRY</span>
            <strong>♥ ♥ ♡</strong>
          </div>
          <div className="pet-buttons">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="cta">
        {/* Disabled for now — camera upload comes in the next step. */}
        <button type="button" disabled>
          Take polaroid photo
        </button>
        <p className="hint">Camera capture and pet generation coming soon.</p>
      </section>
    </main>
  )
}

export default App
