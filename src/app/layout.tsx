import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import NavbarWrapper from "@/components/navbarWrapper";
import AuthInitializer from "@/components/authInItializer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: "#1e293b",
      color: "#fff",
      borderRadius: "8px",
    },
  }}
/>


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
          <Suspense fallback={<div>Loading...</div>}>
            <AuthInitializer>
              <NavbarWrapper />
              <main className="flex-grow">{children}</main>
              <Toaster
                position="bottom-left"
                toastOptions={{
                  style: {
                    background: "#1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    maxWidth: "300px",
                    wordBreak: "break-word",
                  },
                }}
                reverseOrder={false}
              />
            </AuthInitializer>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
