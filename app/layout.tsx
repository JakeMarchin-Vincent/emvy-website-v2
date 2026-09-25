import type { Metadata, Viewport } from "next"
import type { ReactNode } from 'react'
import { colorDark } from "@/lib/design-tokens"
import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import "./globals.css"
import SiteChrome from "@/components/SiteChrome"
import JsonLd from "@/components/JsonLd"
import { organization, webSite, localBusiness } from "@/lib/schema/jsonld"

export const metadata: Metadata = {
  metadataBase: new URL("https://emvyai.com"),
  title: {
    default: "EMVY — AI Systems for Growing Businesses",
    template: "%s | EMVY"
  },
  description: "EMVY helps Australian businesses assess workflows, build practical AI systems, and improve operations.",
  keywords: ["AI consultancy", "AI agents", "workflow automation", "Australian business AI", "AI workflow assessment", "EMVY"],
  icons: {
    icon: [
      { url: "/brand/exports/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/exports/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/exports/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/brand/exports/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "EMVY — AI Systems for Growing Businesses",
    description: "EMVY helps Australian businesses assess workflows, build practical AI systems, and improve operations.",
    url: "https://emvyai.com",
    siteName: "EMVY",
    type: "website",
    locale: "en_AU",
    images: [
      { url: "/brand/exports/og-image.png", width: 1200, height: 630, alt: "EMVY — AI systems for growing businesses" }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EMVY — AI Systems for Growing Businesses",
    description: "AI systems for growing Australian businesses.",
    images: ["/brand/exports/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true
  },
}

// themeColor must live on the separate `viewport` export in Next 14+ to
// keep type-checking honest. Value is the dark-mode background token.
export const viewport: Viewport = {
  themeColor: colorDark.background,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en-AU">
      <body>
        <JsonLd data={[organization(), webSite(), localBusiness()]} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
