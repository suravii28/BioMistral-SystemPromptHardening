import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", axes: ["opsz", "wdth"] });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "CascadeGuard · BioMistral results",
  description: "How well do mitigations stop a medical LLM from caving to false claims?",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
