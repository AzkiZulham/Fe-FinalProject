"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ProtectedPage from "@/src/components/protectedPage";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/context/authContext";

export default function UserProfilePage() {
  const { user } = useAuth();

  const [avatar, setAvatar] = useState("/default-avatar.png");
  const [email, setEmail] = useState(user?.email || "");
  const [isVerified, setIsVerified] = useState(user?.verified || false);
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Sync email & verified dari user context
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setIsVerified(user.verified);
    }
  }, [user]);

  // Upload avatar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedExtensions.includes(file.type)) {
      setError("Format file tidak didukung");
      toast.error("Format file harus .jpg, .jpeg, .png, atau .gif");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Ukuran file maksimal 1MB");
      toast.error("Ukuran file maksimal 1MB");
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal upload foto");

      const data = await res.json();
      setAvatar(data.url || URL.createObjectURL(file));
      toast.success("Foto profil berhasil diperbarui");
    } catch {
      toast.error("Terjadi kesalahan saat upload foto");
    } finally {
      setIsUploading(false);
    }
  };

  // Update personal data
  const handleUpdateData = async () => {
    setIsUpdatingData(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Gagal update data");

      toast.success("Informasi personal berhasil diperbarui");
    } catch {
      toast.error("Gagal memperbarui informasi personal");
    } finally {
      setIsUpdatingData(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Gagal update password");

      toast.success("Password baru berhasil disimpan");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal memperbarui password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const res = await fetch("/api/user/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Gagal kirim email verifikasi");

      toast.success(`Email verifikasi dikirim ke ${email}`);
    } catch {
      toast.error("Gagal mengirim ulang email verifikasi");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ProtectedPage role="USER">
      <main className="min-h-screen bg-gray-50 pb-25">
        {/* Header Profile */}
        <section className="bg-gradient-to-r from-[#2f567a] to-[#3a6b97] text-white py-12">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatar} />
              <AvatarFallback>AZ</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-2xl font-bold">Azki Zulham</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-200">{email}</p>
              {isVerified ? (
                <Badge variant="outline" className="bg-green-600 text-white">
                  Terverifikasi
                </Badge>
              ) : (
                <Badge variant="destructive">Belum Verifikasi</Badge>
              )}
            </div>
            {!isVerified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-3 bg-white text-[#3a6b97] hover:bg-gray-100"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {isResending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
              </Button>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section className="max-w-3xl mx-auto mt-10 px-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-4xl shadow-sm mb-6">
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-[#3a6b97] data-[state=active]:text-white 
                          data-[state=active]:shadow-sm rounded-4xl"
              >
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-[#3a6b97] data-[state=active]:text-white 
                          data-[state=active]:shadow-sm rounded-4xl"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {/* Personal Info */}
            <TabsContent value="info">
              <Card className="shadow-md">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Update Data Personal</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsVerified(false);
                        }}
                      />
                      {!isVerified && (
                        <p className="text-sm text-red-600 mt-1">
                          Email ini belum terverifikasi
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="avatar">Foto Profil</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      {error && (
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleUpdateData} disabled={isUpdatingData}>
                      {isUpdatingData && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isUpdatingData ? "Menyimpan..." : "Update Data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card className="shadow-md">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Keamanan</h2>
                  <div>
                    <Label htmlFor="password">Password Baru</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm">Konfirmasi Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isUpdatingPassword ? "Menyimpan..." : "Update Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </ProtectedPage>
  );
}
