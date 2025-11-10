import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sphira - The Future of DeFi",
  description: "Advanced SIP 2.0 platform with automated yields, emergency locks, and real-time analytics on Stellar blockchain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
