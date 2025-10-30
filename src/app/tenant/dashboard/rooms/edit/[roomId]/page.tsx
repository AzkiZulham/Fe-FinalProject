"use client";

import { useParams, useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ArrowLeft, Loader2, Camera } from "lucide-react";

export default function EditRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [initialValues, setInitialValues] = useState({
    roomName: "",
    price: "",
    description: "",
    quota: "",
    adultQty: "",
    childQty: "",
    roomImg: [] as File[],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/rooms/${roomId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = res.data;
        setInitialValues({
          roomName: data.roomName || "",
          price: data.price?.toString() || "",
          description: data.description || "",
          quota: data.quota?.toString() || "",
          adultQty: data.adultQty?.toString() || "",
          childQty: data.childQty?.toString() || "",
          roomImg: [],
        });

        if (data.roomImgUrl) {
          const urls = Array.isArray(data.roomImgUrl) ? data.roomImgUrl : [data.roomImgUrl];
          setImagePreview(urls);
        }
      } catch (err) {
        console.error("Gagal ambil data kamar:", err);
        alert("Gagal memuat data kamar");
      } finally {
        setIsLoading(false);
      }
    };
    if (roomId) fetchRoom();
  }, [roomId, API_URL, token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const files = Array.from(e.currentTarget.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
        return false;
      }
      return true;
    });

    const currentFiles = initialValues.roomImg || [];
    if (currentFiles.length + validFiles.length > 10) {
      alert("Maksimal 10 gambar per kamar.");
      return;
    }

    setFieldValue("roomImg", [...currentFiles, ...validFiles]);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index: number, setFieldValue: any) => {
    const newFiles = initialValues.roomImg.filter((_: File, i: number) => i !== index);
    setFieldValue("roomImg", newFiles);

    const newPreviews = imagePreview.filter((_: string, i: number) => i !== index);
    setImagePreview(newPreviews);
  };

  const handleBack = () => router.push(`/tenant/dashboard/rooms`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Memuat data kamar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Room List</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-md"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Edit Room
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Perbarui informasi room Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                  if (value) formData.append(key, value as any);
                });

                await axios.put(`${API_URL}/api/rooms/${roomId}`, formData, {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "multipart/form-data",
                  },
                });

                alert("Kamar berhasil diperbarui!");
                router.push(`/tenant/dashboard/rooms`);
              } catch (err) {
                console.error("Gagal update kamar:", err);
                alert("Gagal memperbarui kamar");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nama Room */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Nama Room <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="roomName"
                      as="input"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm sm:text-base"
                      placeholder="Contoh: Deluxe Room dengan View Pantai"
                      required
                    />
                  </div>

                  {/* Harga */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Harga per Malam <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        Rp
                      </span>
                      <Field
                        name="price"
                        type="number"
                        as="input"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        placeholder="500000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Kuota */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Kuota Room <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="quota"
                      type="number"
                      as="input"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  {/* Dewasa */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Jumlah Dewasa <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="adultQty"
                      type="number"
                      as="input"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="2"
                      min="1"
                      required
                    />
                  </div>

                  {/* Anak */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Jumlah Anak
                    </label>
                    <Field
                      name="childQty"
                      type="number"
                      as="input"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Deskripsi Room
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                      placeholder="Tulis deskripsi kamar..."
                    />
                  </div>

                  {/* Upload Gambar */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Gambar Room
                    </label>

                    <div className="flex flex-col gap-4">
                      {imagePreview.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {imagePreview.map((preview, index) => (
                            <div key={index} className="relative w-full h-24 border border-gray-300 rounded-lg overflow-hidden">
                              <Image
                                src={preview}
                                alt={`Preview Gambar ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, setFieldValue)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Camera className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-xs sm:text-sm text-gray-600 text-center">
                          Klik untuk upload gambar baru (maksimal 10 gambar)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:w-1/2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
