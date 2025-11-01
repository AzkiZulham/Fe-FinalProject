"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Info, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProtectedPage from "@/components/protectedPage";
import { axios } from "@/lib/axios";

export default function TenantSecurityForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [hoveredCriterion, setHoveredCriterion] = useState<number | null>(null);

  const criteria = [
    { label: "Minimal 8 karakter", test: (pwd: string) => pwd.length >= 8, tip: "Gunakan setidaknya 8 karakter untuk keamanan optimal." },
    { label: "Huruf besar", test: (pwd: string) => /[A-Z]/.test(pwd), tip: "Tambahkan huruf besar seperti A, B, C untuk meningkatkan kompleksitas." },
    { label: "Huruf kecil", test: (pwd: string) => /[a-z]/.test(pwd), tip: "Gunakan kombinasi huruf kecil seperti a, b, c." },
    { label: "Angka", test: (pwd: string) => /[0-9]/.test(pwd), tip: "Sertakan angka seperti 1, 2, 3 untuk variasi." },
    { label: "Simbol", test: (pwd: string) => /[\W_]/.test(pwd), tip: "Tambahkan simbol seperti !, @, #, $ untuk keamanan ekstra." },
  ];

  const validateAllCriteria = (pwd: string) => criteria.every(c => c.test(pwd));
  const strengthScore = criteria.reduce((acc, c) => acc + (c.test(password) ? 1 : 0), 0);
  
  const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Sangat Lemah";
    if (score <= 2) return "Lemah";
    if (score <= 3) return "Sedang";
    if (score <= 4) return "Kuat";
    return "Sangat Kuat";
  };

  const handleTouchStart = (fieldName: string) => {
    setActiveField(fieldName);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveField(null), 150);
  };

  const handleUpdate = async () => {
    if (!password) {
      return toast.error("Password baru harus diisi");
    }

    if (password !== confirmPassword) {
      return toast.error("Password tidak sama");
    }

    if (!validateAllCriteria(password)) {
      return toast.error("Password belum memenuhi semua kriteria keamanan");
    }

    setIsUpdating(true);
    try {
      await axios.put('/api/tenant/update-password', { password });
      setShowSuccessModal(true);
      toast.success("Password berhasil diperbarui");

      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update password";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const getInputClassName = (fieldName: string) => {
    let className = "pr-10 transition-all duration-300 cursor-text ";
    
    if (activeField === fieldName) {
      className += "border-blue-500 ring-2 ring-blue-200 bg-blue-50 transform scale-[1.02] shadow-md ";
    }
    
    return className;
  };

  const isSubmitDisabled = isUpdating || !password || !confirmPassword || password !== confirmPassword || !validateAllCriteria(password);

  return (
    <ProtectedPage role="TENANT">
      <>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Keamanan Akun Tenant</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Kelola keamanan akun tenant Anda dengan memperbarui password secara berkala
            </p>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Kekuatan Password
                </span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  strengthScore <= 2 ? "bg-red-100 text-red-700" : 
                  strengthScore <= 3 ? "bg-orange-100 text-orange-700" : 
                  strengthScore <= 4 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>
                  {getStrengthLabel(strengthScore)}
                </span>
              </div>
              
              {/* Strength Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ease-out ${getStrengthColor(strengthScore)} shadow-inner`}
                  style={{ width: `${(strengthScore / criteria.length) * 100}%` }}
                />
              </div>

              {/* Criteria List */}
              <div className="space-y-3">
                {criteria.map((criterion, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-white/80"
                    onMouseEnter={() => setHoveredCriterion(index)}
                    onMouseLeave={() => setHoveredCriterion(null)}
                    onTouchStart={() => setHoveredCriterion(index)}
                    onTouchEnd={() => setHoveredCriterion(null)}
                  >
                    {criterion.test(password) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 transition-transform duration-200 hover:scale-110" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 hover:scale-110" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm font-medium transition-all duration-200 ${
                        criterion.test(password) ? "text-green-700" : "text-gray-600"
                      } ${hoveredCriterion === index ? 'font-semibold' : ''}`}>
                        {criterion.label}
                      </span>
                      {hoveredCriterion === index && (
                        <p className="text-xs text-gray-500 mt-1 animate-in fade-in duration-200">
                          {criterion.tip}
                        </p>
                      )}
                    </div>
                    <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="space-y-5">
            {[
              { 
                label: "Password Baru", 
                value: password, 
                setValue: setPassword, 
                show: showPass, 
                setShow: setShowPass,
                placeholder: "Masukkan password baru yang kuat",
                fieldName: "password"
              },
              { 
                label: "Konfirmasi Password", 
                value: confirmPassword, 
                setValue: setConfirmPassword, 
                show: showConfirm, 
                setShow: setShowConfirm,
                placeholder: "Ketik ulang password baru",
                fieldName: "confirmPassword"
              }
            ].map((field) => (
              <div key={field.label} className="group">
                <Label 
                  htmlFor={field.fieldName}
                  className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-blue-600" />
                  {field.label}
                </Label>
                <div className="relative">
                  <Input 
                    id={field.fieldName}
                    type={field.show ? "text" : "password"} 
                    value={field.value} 
                    onChange={(e) => field.setValue(e.target.value)}
                    className={getInputClassName(field.fieldName)}
                    placeholder={field.placeholder}
                    onFocus={() => setActiveField(field.fieldName)}
                    onBlur={() => setActiveField(null)}
                    onTouchStart={() => handleTouchStart(field.fieldName)}
                    onTouchEnd={handleTouchEnd}
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 transition-all duration-300 cursor-pointer touch-manipulation active:scale-95"
                    onClick={() => field.setShow(!field.show)}
                    onTouchStart={() => handleTouchStart(`toggle-${field.fieldName}`)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {field.show ? 
                      <EyeOff size={20} className="hover:scale-110 transition-transform" /> : 
                      <Eye size={20} className="hover:scale-110 transition-transform" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Messages */}
          {password && confirmPassword && password !== confirmPassword && (
            <div className="flex items-center space-x-3 p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl transition-all duration-300 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Password tidak sama. Pastikan kedua password identik.</span>
            </div>
          )}

          {password && confirmPassword && password === confirmPassword && validateAllCriteria(password) && (
            <div className="flex items-center space-x-3 p-4 text-green-600 bg-green-50 border border-green-200 rounded-xl transition-all duration-300 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <span className="text-sm font-medium">Password sudah memenuhi semua kriteria keamanan!</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleUpdate} 
              disabled={isSubmitDisabled}
              className="min-w-36 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Update Password
                  </>
                )}
              </div>
            </Button>
          </div>

          {/* Security Tips */}
          <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tips Keamanan Password untuk Tenant
            </h4>
            <ul className="text-sm text-orange-700 space-y-2">
              <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Gunakan kombinasi huruf, angka, dan simbol yang unik untuk keamanan bisnis</span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Hindari menggunakan informasi bisnis yang mudah ditebak</span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Jangan gunakan password yang sama untuk akun tenant dan personal</span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Ganti password secara berkala setiap 3 bulan untuk keamanan optimal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-10 h-10 text-green-600 animate-pulse" />
                </div>
              </div>
              <DialogTitle className="text-green-700 text-2xl font-bold">
                Password Berhasil Diperbarui!
              </DialogTitle>
              <DialogDescription className="mt-4 text-gray-600 text-base leading-relaxed">
                Password akun tenant Anda telah berhasil diperbarui dengan aman.
                <br />
                <span className="text-sm mt-3 block text-green-600 font-semibold bg-green-50 p-3 rounded-lg border border-green-200">
                  Silakan gunakan password baru Anda untuk login selanjutnya.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button 
                onClick={handleCloseSuccessModal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl px-8 py-2.5 text-base font-semibold"
                onTouchStart={() => handleTouchStart("modalButton")}
                onTouchEnd={handleTouchEnd}
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