import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invitation App',
  description: 'Buat undangan digital yang indah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}