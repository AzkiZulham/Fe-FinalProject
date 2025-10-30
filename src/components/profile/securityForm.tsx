"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { axios } from "@/lib/axios";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SecurityForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const criteria = [
    { label: "Minimal 8 karakter", test: (pwd: string) => pwd.length >= 8, tip: "Gunakan setidaknya 8 karakter." },
    { label: "Huruf besar", test: (pwd: string) => /[A-Z]/.test(pwd), tip: "Tambahkan huruf besar seperti A, B, C." },
    { label: "Huruf kecil", test: (pwd: string) => /[a-z]/.test(pwd), tip: "Tambahkan huruf kecil seperti a, b, c." },
    { label: "Angka", test: (pwd: string) => /[0-9]/.test(pwd), tip: "Tambahkan angka seperti 1, 2, 3." },
    { label: "Simbol", test: (pwd: string) => /[\W_]/.test(pwd), tip: "Tambahkan simbol seperti !, @, #, $." },
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
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesi login tidak valid. Silakan login ulang.");
        return;
      }

      await axios.put('/api/user/update-password', { password });
      
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

  return (
    <>
      <div className="space-y-6">
        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Kekuatan Password</span>
              <span className={`text-sm font-medium ${
                strengthScore <= 2 ? "text-red-600" : 
                strengthScore <= 3 ? "text-orange-600" : 
                strengthScore <= 4 ? "text-blue-600" : "text-green-600"
              }`}>
                {getStrengthLabel(strengthScore)}
              </span>
            </div>
            
            {/* Strength Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strengthScore)}`}
                style={{ width: `${(strengthScore / criteria.length) * 100}%` }}
              />
            </div>

            {/* Criteria List */}
            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {criterion.test(password) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${criterion.test(password) ? "text-green-700" : "text-gray-600"}`}>
                    {criterion.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Fields */}
        <div className="space-y-4">
          {[
            { 
              label: "Password Baru", 
              value: password, 
              setValue: setPassword, 
              show: showPass, 
              setShow: setShowPass,
              placeholder: "Masukkan password baru yang kuat"
            },
            { 
              label: "Konfirmasi Password", 
              value: confirmPassword, 
              setValue: setConfirmPassword, 
              show: showConfirm, 
              setShow: setShowConfirm,
              placeholder: "Ketik ulang password baru"
            }
          ].map((field) => (
            <div key={field.label}>
              <Label htmlFor={field.label.toLowerCase().replace(' ', '-')}>
                {field.label}
              </Label>
              <div className="relative">
                <Input 
                  id={field.label.toLowerCase().replace(' ', '-')}
                  type={field.show ? "text" : "password"} 
                  value={field.value} 
                  onChange={(e) => field.setValue(e.target.value)}
                  className="pr-10"
                  placeholder={field.placeholder}
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => field.setShow(!field.show)}
                >
                  {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Messages */}
        {password && confirmPassword && password !== confirmPassword && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Password tidak sama</span>
          </div>
        )}

        {password && confirmPassword && password === confirmPassword && validateAllCriteria(password) && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Password sudah memenuhi semua kriteria keamanan</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || !password || !confirmPassword || password !== confirmPassword || !validateAllCriteria(password)}
            className="min-w-32"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {isUpdating ? "Menyimpan..." : "Update Password"}
          </Button>
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Tips Keamanan Password
          </h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Gunakan kombinasi huruf, angka, dan simbol</li>
            <li>• Hindari menggunakan informasi pribadi yang mudah ditebak</li>
            <li>• Jangan gunakan password yang sama untuk banyak akun</li>
            <li>• Ganti password secara berkala</li>
          </ul>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-green-600 text-xl">
              Password Berhasil Diperbarui!
            </DialogTitle>
            <DialogDescription className="mt-3 text-gray-600 text-base">
              Password akun Anda telah berhasil diperbarui dengan aman.
              <br />
              <span className="text-sm mt-2 block text-green-600 font-medium">
                Silakan gunakan password baru Anda untuk login selanjutnya.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              onClick={handleCloseSuccessModal}
              className="bg-green-600 text-white hover:bg-green-700 px-6"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}