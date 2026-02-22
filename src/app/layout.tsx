import type { Metadata } from 'next'
import { DM_Serif_Display, Outfit, DM_Mono } from 'next/font/google'
import { Providers } from './providers'
import { AmbientOrbs } from './ambient-orbs'

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Aarogya',
  description: 'Your health records, simplified.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${outfit.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>
          <AmbientOrbs />
          {children}
        </Providers>
      </body>
    </html>
  )
}
