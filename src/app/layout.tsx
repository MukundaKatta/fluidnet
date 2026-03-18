import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FluidNet — Liquid Neural Network Explorer", description: "Novel architecture visualizer, adaptive network diagrams, benchmark comparison, research papers" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body className="bg-gray-950 text-gray-100 antialiased">{children}</body></html>;
}
