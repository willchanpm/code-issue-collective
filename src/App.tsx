import './App.css'
import { PhotoCapture } from './components/PhotoCapture.tsx'

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

      <PhotoCapture />
    </main>
  )
}

export default App
