import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tamagotcha',
  description:
    'Turn a polaroid photo of your friend into an interactive tamagotchi.',
}

export const viewport: Viewport = {
  themeColor: '#fff8ef',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
