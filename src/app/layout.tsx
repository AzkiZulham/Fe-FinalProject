import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/authContext";
import NavbarWrapper from "../components/navbarWrapper";
// import Navbar from "../components/navbar"; 
// import Footer from "../components/footer";

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
        <NavbarWrapper />
        <main className="flex-grow">{children}</main>
        {/* <Footer /> */}
      </AuthProvider> 
      </body>
    </html>
  );
}
