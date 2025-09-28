import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar"; 

export const metadata: Metadata = {
  title: "STAYFINDER",
  description: "Renting made easy with StayFinder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning={true}>      
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
