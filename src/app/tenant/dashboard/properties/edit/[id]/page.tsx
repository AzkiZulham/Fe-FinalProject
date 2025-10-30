"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import ProtectedPage from "@/components/protectedPage";
import Modal from "@/components/modal/modal";

type RoomType = {
  id?: number;
  roomName: string;
  price: number;
  description?: string;
  roomImg: (File | string)[];
  quota?: number;
  adultQty?: number;
  childQty?: number;
  peakSeasons?: {
    id: number;
    startDate: string;
    endDate: string;
    percentage?: number | null;
    nominal?: number | null;
    isAvailable?: boolean;
  }[];
};

type PropertyCategory = {
  id: number;
  category: string;
};

type Property = {
  id: number;
  name: string;
  address: string;
  description?: string;
  picture?: string | null;
  categoryId?: number;
  noRekening?: string;
  destinationBank?: string;
  roomTypes: RoomType[];
};

type PropertyResponse = {
  property: Property;
  reviews: any[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

const safeSrc = (src: string | File | null) => {
  if (!src) return null;
  if (src instanceof File) return URL.createObjectURL(src);
  if (typeof src === 'string') {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) return src;
    if (src.startsWith('/')) return `${API_URL}${src}`;
    return null;
  }
  return null;
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Nama properti wajib diisi")
    .min(3, "Nama properti minimal 3 karakter")
    .max(100, "Nama properti maksimal 100 karakter"),
  address: Yup.string()
    .required("Alamat wajib diisi")
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  description: Yup.string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional(),
  categoryId: Yup.string().optional(),
  noRekening: Yup.string()
    .required("Nomor rekening wajib diisi")
    .matches(/^\d+$/, "Nomor rekening harus berupa angka")
    .min(10, "Nomor rekening minimal 10 digit")
    .max(20, "Nomor rekening maksimal 20 digit"),
  destinationBank: Yup.string()
    .required("Bank tujuan wajib diisi")
    .max(50, "Nama bank maksimal 50 karakter"),
  roomTypes: Yup.array()
    .of(
      Yup.object({
        roomName: Yup.string()
          .required("Nama tipe kamar wajib diisi")
          .min(2, "Nama tipe kamar minimal 2 karakter")
          .max(50, "Nama tipe kamar maksimal 50 karakter"),
        price: Yup.number()
          .required("Harga wajib diisi")
          .min(0, "Harga tidak boleh negatif")
          .max(10000000, "Harga maksimal 10 juta"),
      })
    )
    .min(1, "Minimal harus ada 1 tipe kamar"),
});

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeOldPicture, setRemoveOldPicture] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [propertyRes, categoryRes] = await Promise.all([
          axios.get<PropertyResponse>(`${API_URL}/api/properties/dashboard/${id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
          axios.get<PropertyCategory[]>(`${API_URL}/api/properties/dashboard/categories`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
        ]);

        const processedProperty = {
          ...propertyRes.data.property,
          description: propertyRes.data.property.description || "",
          picture: propertyRes.data.property.picture && propertyRes.data.property.picture !== "null" && propertyRes.data.property.picture.trim() !== "" && (propertyRes.data.property.picture.startsWith('http') || propertyRes.data.property.picture.startsWith('/')) ? propertyRes.data.property.picture : null,
          roomTypes: propertyRes.data.property.roomTypes.map((room: any) => ({
            ...room,
            description: room.description || "",
            roomImg: (Array.isArray(room.roomImg) ? room.roomImg : (room.roomImg ? [room.roomImg] : [])).filter((img: any) => img && img !== "null" && typeof img === 'string' && img.trim() !== "" && (img.startsWith('http') || img.startsWith('/'))),
          })),
        };

        setProperty(processedProperty);
        setCategories(categoryRes.data);
        setPreview(processedProperty.picture && processedProperty.picture !== "null" ? processedProperty.picture : null);
        setDescriptionLength(processedProperty.description?.length || 0);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data properti");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert("File harus berupa gambar");
      return;
    }
    
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveOldPicture(true);
  };

  const handleRemovePicture = () => {
    setSelectedFile(null);
    setPreview(null);
    setRemoveOldPicture(true);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>, setFieldValue: any) {
    const value = e.target.value;
    setDescriptionLength(value.length);
    setFieldValue("description", value);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Memuat data properti...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Properti Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">Properti yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <button
            onClick={() => router.push("/tenant/dashboard/properties")}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage role="TENANT">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={handleCancel}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Properti
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Properti</h1>
                <p className="text-gray-600 text-sm sm:text-base">Perbarui informasi properti dan tipe kamar yang tersedia</p>
              </div>
              <div className="mt-3 lg:mt-0">
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Formik
              enableReinitialize
              validationSchema={validationSchema}
              initialValues={{
                name: property.name,
                address: property.address,
                description: property.description || "",
                categoryId: property.categoryId || "",
                noRekening: property.noRekening || "",
                destinationBank: property.destinationBank || "",
                roomTypes: property.roomTypes || [],
              }}
              onSubmit={async (values) => {
                setSubmitting(true);
                try {
                  const formData = new FormData();
                  formData.append("name", values.name.trim());
                  formData.append("address", values.address.trim());
                  formData.append("description", values.description.trim());
                  formData.append("categoryId", values.categoryId?.toString() || "");
                  formData.append("noRekening", values.noRekening || "");
                  formData.append("destinationBank", values.destinationBank || "");

                  const roomTypesForJson = values.roomTypes.map((room, index) => {
                    const { roomImg, ...rest } = room;
                    if (roomImg && Array.isArray(roomImg)) {
                      roomImg.forEach((img) => {
                        if (img instanceof File) {
                          formData.append(`roomImg_${index}`, img);
                        }
                      });
                    }
                    return {
                      ...rest,
                      roomImg: roomImg.filter(img => typeof img === 'string'),
                    };
                  });

                  formData.append("roomTypes", JSON.stringify(roomTypesForJson));

                  if (selectedFile) formData.append("picture", selectedFile);
                  if (removeOldPicture) formData.append("removeOldPicture", "true");

                  await axios.put(`${API_URL}/api/properties/dashboard/${id}`, formData, {
                    headers: {
                      Authorization: token ? `Bearer ${token}` : "",
                      "Content-Type": "multipart/form-data",
                    },
                  });
                  setShowSuccessModal(true);
                } catch (err) {
                  console.error(err);
                  setShowErrorModal(true);
                  setErrorMessage("Gagal update property. Silakan coba lagi.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Properti <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="name"
                          required
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 text-sm sm:text-base ${
                            errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Masukkan nama properti"
                        />
                        {errors.name && touched.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alamat Lengkap <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="address"
                          required
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 resize-none text-sm sm:text-base ${
                            errors.address && touched.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Masukkan alamat lengkap properti"
                        />
                        {errors.address && touched.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Deskripsi Properti
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            (Opsional - maksimal 1000 karakter)
                          </span>
                        </label>
                        <div className="relative">
                          <Field
                            as="textarea"
                            name="description"
                            rows={4}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 resize-none text-sm sm:text-base ${
                              errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Deskripsikan properti Anda..."
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                              handleDescriptionChange(e, setFieldValue)
                            }
                          />
                          {/* Character Counter */}
                          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                            <span className={`text-xs ${
                              descriptionLength > 1000 ? 'text-red-500' : 
                              descriptionLength > 800 ? 'text-yellow-500' : 'text-gray-400'
                            }`}>
                              {descriptionLength}/1000
                            </span>
                          </div>
                        </div>
                        {errors.description && touched.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Tips: Jelaskan fasilitas, keunggulan lokasi, dan hal menarik lainnya tentang properti Anda.
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Kategori Properti
                        </label>
                        <Field
                          as="select"
                          name="categoryId"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 appearance-none text-sm sm:text-base"
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.category}
                            </option>
                          ))}
                        </Field>
                      </div>

                      {/* Bank Account Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nomor Rekening
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            (Opsional - untuk pembayaran)
                          </span>
                        </label>
                        <Field
                          name="noRekening"
                          type="text"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 text-sm sm:text-base ${
                            errors.noRekening && touched.noRekening ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Masukkan nomor rekening"
                        />
                        {errors.noRekening && touched.noRekening && (
                          <p className="mt-1 text-sm text-red-600">{errors.noRekening}</p>
                        )}
                      </div>

                      {/* Bank Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Bank
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            (Opsional - untuk pembayaran)
                          </span>
                        </label>
                        <Field
                          name="destinationBank"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 text-sm sm:text-base ${
                            errors.destinationBank && touched.destinationBank ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Contoh: BCA, Mandiri, BRI"
                        />
                        {errors.destinationBank && touched.destinationBank && (
                          <p className="mt-1 text-sm text-red-600">{errors.destinationBank}</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Image */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Picture Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Foto Properti
                        </label>
                        
                        {/* Preview */}
                        {preview && safeSrc(preview) && (
                          <div className="mb-3 sm:mb-4">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <div className="relative w-full h-40 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200">
                              <Image
                                src={preview}
                                alt="Preview properti"
                                fill
                                className="object-cover"
                                unoptimized={preview.startsWith('blob:')}
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              <button
                                type="button"
                                onClick={handleRemovePicture}
                                className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-600 text-white p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* File Input */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="picture-upload"
                          />
                          <label
                            htmlFor="picture-upload"
                            className="cursor-pointer block"
                          >
                            <svg className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-xs sm:text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload foto baru
                              </span>{' '}
                              atau drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, JPEG (Maks. 5MB)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Description Tips */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Tips Deskripsi yang Menarik
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Jelaskan fasilitas terdekat (mall, rumah sakit, transportasi)</li>
                          <li>• Sebutkan keunggulan lokasi properti</li>
                          <li>• Deskripsikan fasilitas yang tersedia</li>
                          <li>• Tambahkan informasi unik tentang properti</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Room Types Section */}
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tipe Kamar</h3>
                        <p className="text-sm text-gray-600">Kelola jenis kamar dan harga yang tersedia</p>
                      </div>
                    </div>

                    <FieldArray name="roomTypes">
                      {({ push, remove }) => (
                        <div className="space-y-4 sm:space-y-6">
                          {values.roomTypes.length === 0 ? (
                            <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl bg-gray-50/50 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30">
                              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                              </div>
                              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1">Belum ada tipe kamar</h3>
                              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">Tambahkan tipe kamar pertama Anda untuk mulai mengelola properti</p>
                            </div>
                          ) : (
                            values.roomTypes.map((room: RoomType, index: number) => (
                              <div
                                key={index}
                                className="p-4 sm:p-6 border border-gray-200 rounded-xl sm:rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 space-y-4 sm:space-y-6 relative group"
                              >
                                {/* Header dengan nomor dan tombol hapus */}
                                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100">
                                  <div className="flex items-center">
                                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold mr-2 sm:mr-3">
                                      {index + 1}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Tipe Kamar {index + 1}</h3>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                  >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Nama dan Harga */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Nama Tipe Kamar <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                      name={`roomTypes.${index}.roomName`}
                                      placeholder="Contoh: Deluxe Room, Suite Executive"
                                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                    />
                                    <ErrorMessage 
                                      name={`roomTypes.${index}.roomName`} 
                                      component="div" 
                                      className="text-red-500 text-xs mt-1" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Harga per Malam <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">Rp</span>
                                      <Field
                                        name={`roomTypes.${index}.price`}
                                        type="number"
                                        min="0"
                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                      />
                                    </div>
                                    <ErrorMessage 
                                      name={`roomTypes.${index}.price`} 
                                      component="div" 
                                      className="text-red-500 text-xs mt-1" 
                                    />
                                  </div>
                                </div>

                                {/* Deskripsi */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Kamar</label>
                                  <Field
                                    as="textarea"
                                    name={`roomTypes.${index}.description`}
                                    rows={2}
                                    placeholder="Tuliskan deskripsi singkat tentang fasilitas dan keunggulan kamar ini..."
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm sm:text-base"
                                  />
                                </div>

                                {/* Kuota dan Jumlah Orang */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Kuota Kamar <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                      name={`roomTypes.${index}.quota`}
                                      type="number"
                                      min="1"
                                      placeholder="Jumlah kamar"
                                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Jumlah Dewasa <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                      name={`roomTypes.${index}.adultQty`}
                                      type="number"
                                      min="1"
                                      placeholder="Maksimal dewasa"
                                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Anak</label>
                                    <Field
                                      name={`roomTypes.${index}.childQty`}
                                      type="number"
                                      min="0"
                                      placeholder="Maksimal anak"
                                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                                    />
                                  </div>
                                </div>

                                {/* Gambar Kamar */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Kamar</label>

                                  {/* Upload Gambar */}
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
                                      </div>
                                    </div>
                                  </div>

                                  {/* Images Preview */}
                                  {values.roomTypes[index].roomImg && values.roomTypes[index].roomImg.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm text-gray-600 mb-2">Preview gambar:</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {values.roomTypes[index].roomImg.map((img: any, imgIndex: number) => (
                                          <div key={imgIndex} className="relative">
                                            <Image
                                              src={img instanceof File ? URL.createObjectURL(img) : (typeof img === "string" ? (img.startsWith("http") ? img : `${API_URL}${img}`) : "")}
                                              alt={`Room image ${imgIndex + 1}`}
                                              width={80}
                                              height={80}
                                              className="w-full h-20 object-cover rounded-lg border"
                                              unoptimized
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newImages = values.roomTypes[index].roomImg.filter((_, i: number) => i !== imgIndex);
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

                                </div>

                                {/* Peak Seasons & Availability (readonly) */}
                                {room.peakSeasons && room.peakSeasons.length > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center mb-2">
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                      <p className="text-sm font-semibold text-blue-800">Peak Season & Availability</p>
                                    </div>
                                    <p className="text-xs text-blue-700 mb-3">
                                      Selama periode peak season, kamar tersedia dengan harga yang ditingkatkan.
                                    </p>
                                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 sm:space-y-2">
                                      {room.peakSeasons.map((p: { id: number; startDate: string; endDate: string; percentage?: number | null; nominal?: number | null; isAvailable?: boolean; }, i: number) => {
                                        const isUnavailable = p.isAvailable === false;
                                        const isPeak = !isUnavailable && (p.percentage || p.nominal);
                                        const statusText = isUnavailable ? 'Tidak Tersedia (Unavailable)' : isPeak ? 'Peak Season' : 'Tersedia (Available)';
                                        const dotColor = isUnavailable ? 'bg-red-500' : isPeak ? 'bg-yellow-500' : 'bg-green-500';
                                        return (
                                          <li key={i} className="flex items-start">
                                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2 mt-0.5 flex-shrink-0 ${dotColor}`}></span>
                                            <div>
                                              <span className="font-medium">{statusText}</span><br />
                                              {new Date(p.startDate).toLocaleDateString('id-ID')} - {new Date(p.endDate).toLocaleDateString('id-ID')}{" "}
                                              {isPeak && (p.percentage ? `(+${p.percentage}%)` : p.nominal ? `(+Rp${p.nominal.toLocaleString('id-ID')})` : "")}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              push({
                                roomName: "",
                                price: 0,
                                description: "",
                                roomImg: [],
                                quota: 1,
                                adultQty: 1,
                                childQty: 0,
                                peakSeasons: [],
                              })
                            }
                            className="inline-flex items-center justify-center px-4 sm:px-5 py-3 sm:py-4 border-2 border-dashed border-gray-300 text-sm sm:text-base font-medium rounded-xl sm:rounded-2xl text-gray-600 bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 w-full group"
                          >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Tipe Kamar Baru
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={submitting}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </Form>
                
              )}
            </Formik>

            {/* Success Modal */}
            {showSuccessModal && (
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
                    Properti berhasil diperbarui 🎉
                  </p>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push("/tenant/dashboard/properties");
                    }}
                    className="mt-2 w-full sm:w-auto px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    Kembali ke Daftar Properti
                  </button>
                </div>
              </Modal>
            )}

            {/* Error Modal */}
            {showErrorModal && (
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Memperbarui Properti</h2>
                  <p className="text-red-600 text-sm mb-4">{errorMessage || "Terjadi kesalahan, silakan coba lagi."}</p>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="mt-2 w-full sm:w-auto px-6 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                  >
                    Tutup
                  </button>
                </div>
              </Modal>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Konfirmasi Batal</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Perubahan yang belum disimpan akan hilang. Apakah Anda yakin ingin kembali ke daftar properti?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        router.push("/tenant/dashboard/properties");
                      }}
                      className="px-6 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                    >
                      Ya, Kembali
                    </button>
                  </div>
                </div>
              </Modal>
            )}

          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
