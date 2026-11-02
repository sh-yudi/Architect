import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArchitectAI — Instant House Plans & Regulatory Approvals',
  description: 'AI-generated 2D/3D floor plans, budget estimation, and municipal authority approval documents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
