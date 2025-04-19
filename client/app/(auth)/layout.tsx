export const metadata = {
  title: 'Azion',
  description: 'Azion - Improve your workflow and secure your company with Azion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
