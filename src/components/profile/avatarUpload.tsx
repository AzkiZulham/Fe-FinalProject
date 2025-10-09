"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle2, XCircle, Camera } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { UserData } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export default function AvatarUpload({ userData, setUserData }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const searchParams = useSearchParams();

  // ======================
  // Fetch latest user data
  // ======================
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) return;
      const data = await res.json();
      const normalizedUser: UserData = {
        userName: data.user.userName || "",
        email: data.user.email || "",
        avatar: data.user.avatar || "",
        isEmailVerified:
          data.user.isEmailVerified ||
          data.user.emailVerified ||
          data.user.isMailVerified ||  
          false,
        verified: data.user.verified || false,
        phoneNumber: data.user.phoneNumber || "",
        birthDate: data.user.birthDate || "",
        gender: data.user.gender || "",
        isEmailUpdated: data.user.isEmailUpdated || false,
      };
      setUserData(normalizedUser);
      } catch (err) {
      console.error(err);
      }
  }, [setUserData]);
  
  // ======================
  // Cek hasil verifikasi dari redirect backend
  // ======================
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "success" || verified === "true") {
      (async () => {
        await fetchUserData();
        toast.success("Email kamu berhasil diverifikasi 🎉");
      })();
    } else if (verified === "failed") {
      toast.error("Link verifikasi tidak valid atau sudah kadaluarsa.");
    } else if (verified === "already") {
      toast.info("Email sudah diverifikasi sebelumnya.");
    }
  }, [searchParams, fetchUserData]);

  // ======================
  // Fetch user data on mount to update email verification status
  // ======================
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // ======================
  // Upload Avatar
  // ======================
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return toast.error("Gunakan format JPG atau PNG");
    }

    if (file.size > 1024 * 1024) {
      return toast.error("Ukuran maksimal 1MB");
    }

    // Preview sementara dengan fade-in
    const previewUrl = URL.createObjectURL(file);
    setUserData((prev) => ({ ...prev, avatar: previewUrl }));

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/upload-avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Gagal upload avatar");

      const data = await res.json();
      if (!data.url) throw new Error("URL avatar tidak ditemukan");

      // Update dengan URL final dari server
      setUserData((prev) => ({ ...prev, avatar: data.url }));

      // Revoke preview URL untuk mencegah memory leak
      URL.revokeObjectURL(previewUrl);

      // Tampilkan modal sukses upload avatar
      setShowAvatarModal(true);
      toast.success("Foto profil berhasil diperbarui! 📸");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal upload foto");
      setUserData((prev) => ({ ...prev, avatar: prev.avatar }));
    } finally {
      setIsUploading(false);
    }
  };

  // ======================
  // Kirim Email Verifikasi Pertama (untuk user baru)
  // ======================
  const handleSendVerification = async () => {
    if (!userData.email) return toast.error("Email tidak tersedia");
    setIsSending(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: userData.email }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal mengirim email verifikasi");
      }

      setShowEmailModal(true);
      toast.success(`Email verifikasi telah dikirim ke ${userData.email}.`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal mengirim email verifikasi");
    } finally {
      setIsSending(false);
    }
  };

  // ======================
  // Resend Email Verifikasi (kalau user ganti email)
  // ======================
  const handleResendVerification = async () => {
    if (!userData.email) return toast.error("Email tidak tersedia");
    setIsSending(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: userData.email }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal kirim ulang email verifikasi");
      }

      setShowEmailModal(true);
      toast.success(
        `Email verifikasi baru telah dikirim ke ${userData.email}. Silakan cek inbox.`
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal mengirim ulang verifikasi");
    } finally {
      setIsSending(false);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar Section */}
      <div className="relative group">
        <Avatar className="w-32 h-32 border-4 border-white shadow-2xl transition-all duration-300 group-hover:shadow-xl">
          {userData.avatar ? (
            <AvatarImage 
              src={userData.avatar} 
              alt="User Avatar" 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2f567a]">
              {userData.userName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Upload Button */}
        <label
          htmlFor="avatar-upload"
          className="absolute -bottom-2 -right-2 bg-white text-[#2f567a] p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-105"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* User Info */}
      <div className="mt-6 space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {userData.userName || "USER"}
        </h1>
        <p className="text-white">{userData.email}</p>
      </div>

      {/* Email Verification Status */}
      <div className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm">
        {userData.isEmailVerified ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Email Terverifikasi</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Email Belum Terverifikasi</span>
          </>
        )}
      </div>

      {/* Verification Button */}
      {!userData.isEmailVerified && (
        <Button
          onClick={
            userData.isEmailUpdated
              ? handleResendVerification
              : handleSendVerification
          }
          disabled={isSending}
          className="mt-4 bg-white text-[#2f567a] hover:bg-gray-50 flex items-center shadow-md border border-gray-200"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-2" />
          )}
          {isSending
            ? "Mengirim..."
            : userData.isEmailUpdated
            ? "Kirim Ulang Verifikasi"
            : "Verifikasi Email"}
        </Button>
      )}

      {/* ====================== */}
      {/* MODAL KONFIRMASI UPLOAD AVATAR BERHASIL */}
      {/* ====================== */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-green-600 text-xl">
              Foto Profil Berhasil Diperbarui!
            </DialogTitle>
            <DialogDescription className="mt-3 text-gray-600 text-base">
              Foto profil Anda telah berhasil diubah dan disimpan.
              <br />
              <span className="text-sm mt-2 block text-gray-500">
                Perubahan ini akan terlihat di semua perangkat.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowAvatarModal(false)}
              className="bg-green-600 text-white hover:bg-green-700 px-6"
            >
              Keren!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====================== */}
      {/* MODAL KONFIRMASI EMAIL */}
      {/* ====================== */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-[#2f567a] text-xl">
              Email Verifikasi Dikirim
            </DialogTitle>
            <DialogDescription className="mt-3 text-gray-600 text-base">
              Kami telah mengirimkan email verifikasi ke <br />
              <strong className="text-[#2f567a]">{userData.email}</strong>
              <br />
              <span className="text-sm mt-2 block">
                Silakan cek kotak masuk atau folder spam Anda untuk menyelesaikan proses verifikasi.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowEmailModal(false)}
              className="bg-[#2f567a] text-white hover:bg-[#23425e] px-6"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}