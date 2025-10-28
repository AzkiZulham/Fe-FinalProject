"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protectedPage";
import Modal from "@/components/modal/modal";

interface PropertyCategory {
  id: number;
  category: string;
}

export default function AddPropertyPage() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<PropertyCategory[]>(`${API_URL}/api/properties/dashboard/categories`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        alert("Gagal memuat kategori properti");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [API_URL, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Memuat data kategori...
      </div>
    );
  }

  return (
    <ProtectedPage role="TENANT">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Tambah Properti Baru</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Lengkapi informasi properti Anda untuk mulai menyewakan kamar
          </p>
        </div>

        <Formik
          initialValues={{
            name: "",
            categoryId: "",
            description: "",
            address: "",
            city: "",
            picture: undefined as File | undefined,
            noRekening: "",
            destinationBank: "",
            roomTypes: [
              {
                roomName: "",
                price: "",
                description: "",
                quota: "1",
                adultQty: "1",
                childQty: "0",
                roomImg: [] as (File | string)[],
              },
            ],
          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Nama properti wajib diisi"),
            categoryId: Yup.string().required("Kategori wajib dipilih"),
            address: Yup.string().required("Alamat wajib diisi"),
            city: Yup.string().required("Kota wajib diisi"),
            noRekening: Yup.string().required("Nomor rekening wajib diisi"),
            destinationBank: Yup.string().required("Bank tujuan wajib diisi"),
            roomTypes: Yup.array().of(
              Yup.object({
                roomName: Yup.string().required("Nama tipe kamar wajib diisi"),
                price: Yup.number().required("Harga wajib diisi").min(0, "Harga tidak boleh negatif"),
                quota: Yup.number().required("Kuota wajib diisi").min(1, "Kuota minimal 1"),
                adultQty: Yup.number().required("Jumlah dewasa wajib diisi").min(1, "Minimal 1 dewasa"),
                childQty: Yup.number().min(0, "Jumlah anak tidak boleh negatif"),
              })
            ).min(1, "Minimal satu tipe kamar"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const formData = new FormData();
              formData.append("name", values.name);
              formData.append("categoryId", values.categoryId);
              formData.append("description", values.description);
              formData.append("address", values.address);
              formData.append("city", values.city);
              formData.append("noRekening", values.noRekening);
              formData.append("destinationBank", values.destinationBank);

              if (values.picture) formData.append("picture", values.picture);
              formData.append("roomTypes", JSON.stringify(values.roomTypes));
              values.roomTypes.forEach((room, index) => {
                if (room.roomImg && Array.isArray(room.roomImg)) {
                  room.roomImg.forEach((img: any) => {
                    if (img instanceof File) {
                      formData.append(`roomImg_${index}`, img);
                    }
                  });
                }
              });

              await axios.post(`${API_URL}/api/properties/dashboard/add`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              setShowSuccessModal(true);
            } catch (err: any) {
              console.error(err);
              setErrorMessage(err.response?.data?.message || "Gagal menambahkan properti. Silakan coba lagi.");
              setShowErrorModal(true);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6 sm:space-y-8">
              {/* === Property Information Card === */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Informasi Properti</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">Detail utama properti Anda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Property Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Properti <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="Contoh: Hotel Grand Paradise"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-sm sm:text-base"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="categoryId" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="address"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="Alamat lengkap properti"
                    />
                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kota <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="city"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="Kota lokasi properti"
                    />
                    <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Rekening <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="noRekening"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="Nomor rekening untuk pembayaran"
                    />
                    <ErrorMessage name="noRekening" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bank Tujuan <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="destinationBank"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="Nama bank tujuan"
                    />
                    <ErrorMessage name="destinationBank" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Properti
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm sm:text-base"
                      placeholder="Jelaskan fasilitas, keunggulan, dan daya tarik properti Anda..."
                    />
                  </div>

                  {/* Property Picture */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Foto Properti Utama
                    </label>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="cursor-pointer">
                          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-center text-sm">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Pilih Foto
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFieldValue("picture", file);
                                setPreviewImage(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">PNG, JPG (Maks. 5MB)</span>
                      </div>
                      
                      {previewImage && (
                        <div className="relative w-full max-w-md h-48 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFieldValue("picture", null);
                              setPreviewImage(null);
                            }}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white p-1 sm:p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* === Room Types Section === */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tipe Kamar</h2>
                      <p className="text-gray-500 text-xs sm:text-sm">Kelola berbagai tipe kamar yang tersedia</p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-lg">
                    {values.roomTypes.length} kamar
                  </div>
                </div>

                <FieldArray name="roomTypes">
                  {({ remove, push }) => (
                    <div className="space-y-4 sm:space-y-6">
                      {values.roomTypes.map((room, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gray-50/50 hover:bg-white transition-all duration-300 group"
                        >
                          {/* Room Header */}
                          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-md sm:rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold">
                                {index + 1}
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tipe Kamar {index + 1}</h3>
                            </div>
                            {values.roomTypes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Room Form Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Room Name */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Tipe Kamar <span className="text-red-500">*</span>
                              </label>
                              <Field
                                name={`roomTypes.${index}.roomName`}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                placeholder="Contoh: Deluxe Room, Suite Executive"
                              />
                              <ErrorMessage name={`roomTypes.${index}.roomName`} component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga per Malam <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">Rp</span>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.price`}
                                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                  placeholder="750000"
                                  min="0"
                                />
                              </div>
                              <ErrorMessage name={`roomTypes.${index}.price`} component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Capacity Grid */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Kuota <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.quota`}
                                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                  min="1"
                                />
                                <ErrorMessage name={`roomTypes.${index}.quota`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Dewasa <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.adultQty`}
                                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                  min="1"
                                />
                                <ErrorMessage name={`roomTypes.${index}.adultQty`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Anak</label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.childQty`}
                                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                  min="0"
                                />
                                <ErrorMessage name={`roomTypes.${index}.childQty`} component="div" className="text-red-500 text-sm mt-1" />
                              </div>
                            </div>

                            {/* Room Image */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Foto Kamar
                              </label>

                              {/* Existing Images Preview */}
                              {values.roomTypes[index].roomImg && Array.isArray(values.roomTypes[index].roomImg) && values.roomTypes[index].roomImg.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-2">Gambar yang sudah ada:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {values.roomTypes[index].roomImg.filter((img) => typeof img === 'string').map((img: string, imgIndex: number) => (
                                      <div key={imgIndex} className="relative">
                                        <Image
                                          src={img}
                                          alt={`Room image ${imgIndex + 1}`}
                                          width={80}
                                          height={80}
                                          className="w-full h-20 object-cover rounded-lg border"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentImages = values.roomTypes[index].roomImg || [];
                                            const newImages = currentImages.filter((item: any) => item !== img);
                                            setFieldValue(`roomTypes.${index}.roomImg`, newImages);
                                          }}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* New Images Upload */}
                              <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Upload Gambar Baru
                                </label>
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <label className="cursor-pointer">
                                      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-center text-sm">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Pilih Gambar
                                      </div>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files || []);
                                          const validFiles = files.filter(file => {
                                            if (file.size > 5 * 1024 * 1024) {
                                              alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
                                              return false;
                                            }
                                            return true;
                                          });

                                          const currentImages = values.roomTypes[index].roomImg || [];
                                          const allImages = [...currentImages, ...validFiles];

                                          if (allImages.length > 10) {
                                            alert("Maksimal 10 gambar per kamar.");
                                            return;
                                          }

                                          setFieldValue(`roomTypes.${index}.roomImg`, allImages);
                                        }}
                                      />
                                    </label>
                                    <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                                      <p>PNG, JPG, JPEG (Maks. 5MB per gambar)</p>
                                      <p>Maksimal 10 gambar total</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* New Images Preview */}
                              {values.roomTypes[index].roomImg && Array.isArray(values.roomTypes[index].roomImg) && values.roomTypes[index].roomImg.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-2">Preview gambar baru:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {values.roomTypes[index].roomImg.map((img: any, imgIndex: number) => {
                                      if (typeof img === 'string') return null; 
                                      return (
                                        <div key={`new-${imgIndex}`} className="relative">
                                          <Image
                                            src={URL.createObjectURL(img)}
                                            alt={`New room image ${imgIndex + 1}`}
                                            width={80}
                                            height={80}
                                            className="w-full h-20 object-cover rounded-lg border"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newImages = values.roomTypes[index].roomImg.filter((_: any, i: number) => i !== imgIndex);
                                              setFieldValue(`roomTypes.${index}.roomImg`, newImages);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi Kamar
                              </label>
                              <Field
                                as="textarea"
                                name={`roomTypes.${index}.description`}
                                rows={2}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm sm:text-base"
                                placeholder="Jelaskan fasilitas dan keunggulan kamar ini..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Room Button */}
                      <button
                        type="button"
                        onClick={() =>
                          push({
                            roomName: "",
                            price: "",
                            description: "",
                            quota: "1",
                            adultQty: "1",
                            childQty: "0",
                            roomImg: [],
                          })
                        }
                        className="w-full py-3 sm:py-4 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium text-sm sm:text-base">Tambah Tipe Kamar Baru</span>
                        </div>
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    "Simpan Properti"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* ✅ Success Modal */}
        <Modal
          open={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push("/tenant/dashboard/properties");
          }}
          title=""
        >
          <div className="flex flex-col items-center text-center p-4 sm:p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Berhasil!</h2>
            <p className="text-green-600 text-sm mb-4">
              Properti berhasil ditambahkan ke daftar kamu 🎉
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/tenant/dashboard/properties");
              }}
              className="mt-2 w-full sm:w-auto px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </Modal>

        {/* ❌ Error Modal */}
        <Modal
          open={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title=""
        >
          <div className="flex flex-col items-center text-center p-4 sm:p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Menambahkan Properti</h2>
            <p className="text-red-600 text-sm mb-4">{errorMessage || "Terjadi kesalahan, silakan coba lagi."}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-2 w-full sm:w-auto px-6 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Tutup
            </button>
          </div>
        </Modal>

        {/* ❓ Cancel Modal */}
        <Modal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title=""
        >
          <div className="flex flex-col items-center text-center p-4 sm:p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Konfirmasi Batal</h2>
            <p className="text-gray-600 text-sm mb-4">
              Apakah Anda yakin ingin membatalkan penambahan properti? Data yang sudah diisi akan hilang.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  router.back();
                }}
                className="flex-1 px-6 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Ya, Batal
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-2 rounded-xl bg-gray-600 text-white font-medium hover:bg-gray-700 transition"
              >
                Tidak
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
    </ProtectedPage>
  );
}
