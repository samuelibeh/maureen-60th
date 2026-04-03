import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maureen's 60th Birthday Celebration",
  description: "Join us to celebrate Maureen's 60th birthday — 9 May 2026, Ikeja, Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
