"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  MailCheck,
  User,
  Phone,
  Calendar,
  Mail,
  VenusAndMars,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { UserData } from "./types";

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

interface Props {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export default function PersonalInfoForm({ userData, setUserData }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  if (!userData) {
    return <p className="text-gray-500">Memuat data pengguna...</p>;
  }

  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "email" && value !== prev.email
        ? {
            isEmailVerified: false,
            isEmailUpdated: true,
          }
        : {}),
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesi login tidak valid. Silakan login ulang.");
        setIsUpdating(false);
        return;
      }

      const payload = {
        ...userData,
        birthDate: userData.birthDate
          ? new Date(userData.birthDate).toISOString()
          : null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const body = await res.json();

      if (!res.ok) throw new Error(body.message || "Update profil gagal");

      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const userBody = await userRes.json();
      if (userRes.ok) {
        setUserData({
          ...userBody.user,
          isEmailVerified: userBody.user.isEmailUpdated ? false : userBody.user.isEmailVerified,
          isEmailUpdated: userBody.user.isEmailUpdated !== undefined ? userBody.user.isEmailUpdated : userData.email !== userBody.user.email,
        });
      } else {
        setUserData((prev) => ({
          ...prev,
          ...body.user,
          isEmailVerified: body.user.isEmailUpdated ? false : (body.user.isEmailVerified !== undefined ? body.user.isEmailVerified : false),
          isEmailUpdated: body.user.isEmailUpdated !== undefined ? body.user.isEmailUpdated : prev.email !== body.user.email,
        }));
      }

      const emailChanged = userData.email !== body.user?.email;

      if (
        emailChanged ||
        body.message?.toLowerCase().includes("verifikasi email")
      ) {
        setShowVerificationModal(true);
        toast.success(
          "Profil berhasil diperbarui. Silakan verifikasi email baru Anda."
        );
      } else {
        setShowSuccessModal(true);
        toast.success(stripHtml(body.message) || "Profil berhasil diperbarui");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui data";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getFieldClassName = (value: string) =>
    !value ? "border-orange-300 bg-orange-50 placeholder-orange-400" : "";

  const formatBirthDate = (dateString: string) => {
    if (!dateString) return "Belum diisi";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Laki-laki";
      case "FEMALE":
        return "Perempuan";
      case "OTHER":
        return "Lainnya";
      default:
        return "Belum diisi";
    }
  };

  return (
    <>
      {/* Rangkuman Data Profil */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Rangkuman Profil Anda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Nama Lengkap</p>
              <p className="text-gray-700">
                {userData.userName || "Belum diisi"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Email</p>
              <p className="text-gray-700">{userData.email || "Belum diisi"}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Nomor Telepon</p>
              <p className="text-gray-700">
                {userData.phoneNumber || "Belum diisi"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Tanggal Lahir</p>
              <p className="text-gray-700">
                {formatBirthDate(userData.birthDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <VenusAndMars className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Jenis Kelamin</p>
              <p className="text-gray-700">{formatGender(userData.gender)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Status Verifikasi</p>
              <p
                className={`font-medium ${
                  userData.isEmailVerified
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {userData.isEmailVerified
                  ? "Email Terverifikasi"
                  : "Belum Verifikasi"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Input */}
      <div className="space-y-4">
        {/* Nama Lengkap */}
        <div>
          <Label htmlFor="userName">Nama Lengkap</Label>
          <Input
            id="userName"
            value={userData.userName || ""}
            onChange={(e) => handleChange("userName", e.target.value)}
            placeholder={userData.userName ? "" : "Masukkan nama lengkap Anda"}
            className={getFieldClassName(userData.userName)}
          />
          {userData.userName ? (
            <p className="text-sm text-green-600 mt-1">✓ Data terisi</p>
          ) : (
            <p className="text-sm text-orange-600 mt-1">✗ Wajib diisi</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={userData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={userData.email ? "" : "Masukkan alamat email aktif"}
            className={getFieldClassName(userData.email)}
          />
          {userData.email ? (
            <p className="text-sm text-green-600 mt-1">✓ Data terisi</p>
          ) : (
            <p className="text-sm text-orange-600 mt-1">✗ Wajib diisi</p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <Label htmlFor="phoneNumber">Nomor Telepon</Label>
          <Input
            id="phoneNumber"
            value={userData.phoneNumber || ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            placeholder={userData.phoneNumber ? "" : "Contoh: 081234567890"}
            className={getFieldClassName(userData.phoneNumber)}
          />
          {userData.phoneNumber ? (
            <p className="text-sm text-green-600 mt-1">✓ Data terisi</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Opsional - untuk notifikasi penting
            </p>
          )}
        </div>

        {/* Tanggal Lahir */}
        <div>
          <Label htmlFor="birthDate">Tanggal Lahir</Label>
          <Input
            id="birthDate"
            type="date"
            value={userData.birthDate || ""}
            onChange={(e) => handleChange("birthDate", e.target.value)}
            className={getFieldClassName(userData.birthDate)}
          />
          {userData.birthDate ? (
            <p className="text-sm text-green-600 mt-1">✓ Data terisi</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Opsional - pilih tanggal lahir Anda
            </p>
          )}
        </div>

        {/* Jenis Kelamin */}
        <div>
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <select
            id="gender"
            value={userData.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            className={`w-full border rounded px-2 py-1 ${getFieldClassName(
              userData.gender
            )}`}
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
            <option value="OTHER">Lainnya</option>
          </select>
          {userData.gender ? (
            <p className="text-sm text-green-600 mt-1">✓ Data terisi</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Opsional - pilih jenis kelamin Anda
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="min-w-32"
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUpdating ? "Menyimpan..." : "Update Data"}
          </Button>
        </div>
      </div>

      {/* Modal Sukses Update */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <DialogTitle>Data Berhasil Diperbarui</DialogTitle>
            <DialogDescription>
              Semua perubahan telah berhasil disimpan ke sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>Oke</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Verifikasi Email */}
      <Dialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
      >
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <MailCheck className="w-12 h-12 text-blue-500" />
            </div>
            <DialogTitle>Verifikasi Email Baru Diperlukan</DialogTitle>
            <DialogDescription className="mt-2 text-gray-700">
              <p className="mb-3">
                Email Anda telah diubah menjadi <b>{userData.email}</b>.
              </p>
              <p>
                Kami telah mengirimkan link verifikasi ke email baru Anda.
                Silakan cek inbox atau folder spam untuk mengaktifkan email ini.
              </p>
              <p className="mt-3 text-sm text-orange-600">
                Status email akan berubah menjadi &quot;Terverifikasi&quot;
                setelah Anda mengklik link verifikasi.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowVerificationModal(false)}>
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
