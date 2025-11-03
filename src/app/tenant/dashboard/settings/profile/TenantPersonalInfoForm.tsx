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
  Edit3,
  Save,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState<TenantData>(tenantData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFormData(tenantData);
  }, [tenantData]);

  if (!tenantData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <p className="text-gray-500">Memuat data tenant...</p>
      </div>
    );
  }

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
  };

  const handleFieldBlur = (fieldName: string) => {
    setActiveField(null);
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handleChange = (field: keyof TenantData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        username: formData.username || "",
        email: formData.email || "",
        phoneNumber: formData.phoneNumber || "",
        birthDate: formData.birthDate
          ? new Date(formData.birthDate).toISOString()
          : null,
        gender: formData.gender || "",
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

  const getFieldClassName = (value: string, fieldName: string) => {
    let className = "transition-all duration-300 cursor-text ";
    
    if (!value) {
      className += "border-orange-300 bg-orange-50 placeholder-orange-400 ";
    } else {
      className += "border-gray-300 bg-white ";
    }

    if (activeField === fieldName) {
      className += "border-blue-500 ring-2 ring-blue-200 bg-blue-50 transform scale-[1.02] shadow-md ";
    } else if (touchedFields.has(fieldName) && !value) {
      className += "border-red-300 bg-red-50 ring-1 ring-red-200 ";
    }

    return className;
  };

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

  const handleTouchStart = (fieldName: string) => {
    setActiveField(fieldName);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveField(null), 150);
  };

  return (
    <ProtectedPage role="TENANT">
      <>
        {/* Rangkuman Data Profil */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Rangkuman Profil Tenant Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Nama Lengkap</p>
                <p className="text-gray-700">
                  {tenantData.username || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Email</p>
                <p className="text-gray-700">
                  {tenantData.email || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
              <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Nomor Telepon</p>
                <p className="text-gray-700">
                  {tenantData.phoneNumber || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Tanggal Lahir</p>
                <p className="text-gray-700">
                  {formatBirthDate(tenantData.birthDate || "")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
              <VenusAndMars className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Jenis Kelamin</p>
                <p className="text-gray-700">
                  {formatGender(tenantData.gender || "")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default">
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
        <div className="space-y-6">
          {/* Nama Lengkap */}
          <div className="group">
            <Label htmlFor="username" className="flex items-center gap-2 mb-2 cursor-pointer">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Nama Lengkap
            </Label>
            <Input
              id="username"
              value={formData.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
              onFocus={() => handleFieldFocus("username")}
              onBlur={() => handleFieldBlur("username")}
              onTouchStart={() => handleTouchStart("username")}
              onTouchEnd={handleTouchEnd}
              placeholder={
                formData.username ? "" : "Masukkan nama lengkap Anda"
              }
              className={getFieldClassName(formData.username, "username")}
            />
            {formData.username ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Data terisi
              </p>
            ) : (
              <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Wajib diisi
              </p>
            )}
          </div>

          {/* Email */}
          <div className="group">
            <Label htmlFor="email" className="flex items-center gap-2 mb-2 cursor-pointer">
              <Mail className="w-4 h-4 text-blue-600" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => handleFieldFocus("email")}
              onBlur={() => handleFieldBlur("email")}
              onTouchStart={() => handleTouchStart("email")}
              onTouchEnd={handleTouchEnd}
              placeholder={
                formData.email ? "" : "Masukkan alamat email aktif"
              }
              className={getFieldClassName(formData.email, "email")}
            />
            {formData.email ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Data terisi
              </p>
            ) : (
              <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Wajib diisi
              </p>
            )}
          </div>

          {/* Nomor Telepon */}
          <div className="group">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2 mb-2 cursor-pointer">
              <Phone className="w-4 h-4 text-blue-600" />
              Nomor Telepon
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              onFocus={() => handleFieldFocus("phoneNumber")}
              onBlur={() => handleFieldBlur("phoneNumber")}
              onTouchStart={() => handleTouchStart("phoneNumber")}
              onTouchEnd={handleTouchEnd}
              placeholder={formData.phoneNumber ? "" : "Contoh: 081234567890"}
              className={getFieldClassName(formData.phoneNumber, "phoneNumber")}
            />
            {formData.phoneNumber ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Data terisi
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Opsional - untuk notifikasi penting
              </p>
            )}
          </div>

          {/* Tanggal Lahir */}
          <div className="group">
            <Label htmlFor="birthDate" className="flex items-center gap-2 mb-2 cursor-pointer">
              <Calendar className="w-4 h-4 text-blue-600" />
              Tanggal Lahir
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={
                formData.birthDate ? formData.birthDate.split("T")[0] : ""
              }
              onChange={(e) => handleChange("birthDate", e.target.value)}
              onFocus={() => handleFieldFocus("birthDate")}
              onBlur={() => handleFieldBlur("birthDate")}
              onTouchStart={() => handleTouchStart("birthDate")}
              onTouchEnd={handleTouchEnd}
              className={getFieldClassName(formData.birthDate || "", "birthDate")}
            />
            {formData.birthDate ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Data terisi
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Opsional - pilih tanggal lahir Anda
              </p>
            )}
          </div>

          {/* Jenis Kelamin */}
          <div className="group">
            <Label htmlFor="gender" className="flex items-center gap-2 mb-2 cursor-pointer">
              <VenusAndMars className="w-4 h-4 text-blue-600" />
              Jenis Kelamin
            </Label>
            <select
              id="gender"
              value={formData.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              onFocus={() => handleFieldFocus("gender")}
              onBlur={() => handleFieldBlur("gender")}
              onTouchStart={() => handleTouchStart("gender")}
              onTouchEnd={handleTouchEnd}
              className={`w-full border rounded-lg px-3 py-2 transition-all duration-300 cursor-pointer ${
                getFieldClassName(formData.gender || "", "gender")
              }`}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
              <option value="OTHER">Lainnya</option>
            </select>
            {formData.gender ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Data terisi
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <VenusAndMars className="w-4 h-4" />
                Opsional - pilih jenis kelamin Anda
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="min-w-32 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl group relative overflow-hidden"
              onTouchStart={() => handleTouchStart("updateButton")}
              onTouchEnd={handleTouchEnd}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center gap-2">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Update Data
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Modal Sukses Update */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-green-700">Data Berhasil Diperbarui</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Semua perubahan telah berhasil disimpan ke sistem.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation"
              >
                Oke
              </Button>
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
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-blue-700">Verifikasi Email Baru Diperlukan</DialogTitle>
              <DialogDescription className="mt-2 text-gray-700 text-left">
                <p className="mb-3">
                  Email Anda telah diubah menjadi <b className="text-blue-700">{tenantData.email}</b>.
                </p>
                <p>
                  Kami telah mengirimkan link verifikasi ke email baru Anda.
                  Silakan cek inbox atau folder spam untuk mengaktifkan email
                  ini.
                </p>
                <p className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                  Status email akan berubah menjadi &quot;Terverifikasi&quot;
                  setelah Anda mengklik link verifikasi.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setShowVerificationModal(false)}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation"
              >
                Mengerti
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </ProtectedPage>
  );
}