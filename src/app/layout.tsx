import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/authContext";
import NavbarWrapper from "../components/navbarWrapper";
import AuthInitializer from "../components/authInItializer";

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
        <AuthProvider>
          <AuthInitializer>
            <NavbarWrapper />
            <main className="flex-grow">{children}</main>
          </AuthInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
