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
import { TenantData } from "./TenantTypes";
import ProtectedPage from "@/components/protectedPage";
import { axios } from "@/lib/axios";

interface Props {
  tenantData: TenantData;
  setTenantData: React.Dispatch<React.SetStateAction<TenantData>>;
}

export default function TenantPersonalInfoForm({
  tenantData,
  setTenantData,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  if (!tenantData) {
    return <p className="text-gray-500">Memuat data tenant...</p>;
  }

  const handleChange = (field: keyof TenantData, value: string) => {
    setTenantData((prev) => ({
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
      const payload = {
        username: tenantData.username || "",
        email: tenantData.email || "",
        phoneNumber: tenantData.phoneNumber || "",
        birthDate: tenantData.birthDate
          ? new Date(tenantData.birthDate).toISOString()
          : null,
        gender: tenantData.gender || "",
      };

      const res = await axios.put('/api/tenant/update-profile', payload);
      const body = res.data;

      setTenantData((prev) => ({
        ...prev,
        username: body.user.username,
        email: body.user.email,
        phoneNumber: body.user.phoneNumber,
        birthDate: body.user.birthDate ? body.user.birthDate.split("T")[0] : "",
        gender: body.user.gender,
        verified: body.user.isVerified,
        isEmailVerified: body.user.isVerified,
        isEmailUpdated: false,
      }));

      const emailChanged = tenantData.email !== body.user?.email;

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
        toast.success(body.message || "Profil berhasil diperbarui");
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
    <ProtectedPage role="TENANT">
      <>
        {/* Rangkuman Data Profil */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Rangkuman Profil Tenant Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Nama Lengkap</p>
                <p className="text-gray-700">
                  {tenantData.username || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Email</p>
                <p className="text-gray-700">
                  {tenantData.email || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Nomor Telepon</p>
                <p className="text-gray-700">
                  {tenantData.phoneNumber || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Tanggal Lahir</p>
                <p className="text-gray-700">
                  {formatBirthDate(tenantData.birthDate || "")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <VenusAndMars className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Jenis Kelamin</p>
                <p className="text-gray-700">
                  {formatGender(tenantData.gender || "")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Status Verifikasi</p>
                <p
                  className={`font-medium ${
                    tenantData.isEmailVerified
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {tenantData.isEmailVerified
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
            <Label htmlFor="username">Nama Lengkap</Label>
            <Input
              id="username"
              value={tenantData.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder={
                tenantData.username ? "" : "Masukkan nama lengkap Anda"
              }
              className={getFieldClassName(tenantData.username)}
            />
            {tenantData.username ? (
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
              value={tenantData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={
                tenantData.email ? "" : "Masukkan alamat email aktif"
              }
              className={getFieldClassName(tenantData.email)}
            />
            {tenantData.email ? (
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
              value={tenantData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder={tenantData.phoneNumber ? "" : "Contoh: 081234567890"}
              className={getFieldClassName(tenantData.phoneNumber)}
            />
            {tenantData.phoneNumber ? (
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
              value={
                tenantData.birthDate ? tenantData.birthDate.split("T")[0] : ""
              }
              onChange={(e) => handleChange("birthDate", e.target.value)}
              className={getFieldClassName(tenantData.birthDate || "")}
            />
            {tenantData.birthDate ? (
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
              value={tenantData.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={`w-full border rounded px-2 py-1 ${getFieldClassName(
                tenantData.gender || ""
              )}`}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
              <option value="OTHER">Lainnya</option>
            </select>
            {tenantData.gender ? (
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
                  Email Anda telah diubah menjadi <b>{tenantData.email}</b>.
                </p>
                <p>
                  Kami telah mengirimkan link verifikasi ke email baru Anda.
                  Silakan cek inbox atau folder spam untuk mengaktifkan email
                  ini.
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
    </ProtectedPage>
  );
}
