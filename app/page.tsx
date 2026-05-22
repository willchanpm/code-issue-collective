import { PhotoCapture } from '@/components/PhotoCapture'

export default function HomePage() {
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

      <PhotoCapture />
    </main>
  )
}
