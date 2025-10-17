"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/protectedPage";

interface PropertyCategory {
  id: number;
  category: string;
}

export default function AddPropertyPage() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Tambah Properti Baru</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
            roomTypes: [
              {
                roomName: "",
                price: "",
                description: "",
                quota: "1",
                adultQty: "1",
                childQty: "0",
                roomImg: undefined as File | undefined,
              },
            ],
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const formData = new FormData();
              formData.append("name", values.name);
              formData.append("categoryId", values.categoryId);
              formData.append("description", values.description);
              formData.append("address", values.address);
              formData.append("city", values.city);

              if (values.picture) formData.append("picture", values.picture);
              formData.append("roomTypes", JSON.stringify(values.roomTypes));
              values.roomTypes.forEach((room, index) => {
                if (room.roomImg) {
                  formData.append(`roomImg_${index}`, room.roomImg);
                }
              });

              await axios.post(`${API_URL}/api/properties/dashboard/add`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              alert("Property created successfully!");
              router.push("/tenant/dashboard/properties");
            } catch (err) {
              console.error(err);
              alert("Failed to create property");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-8">
              {/* === Property Information Card === */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informasi Properti</h2>
                    <p className="text-gray-500 text-sm">Detail utama properti Anda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Properti <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Contoh: Hotel Grand Paradise"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category}
                        </option>
                      ))}
                    </Field>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Alamat lengkap properti"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kota <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Kota lokasi properti"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Properti
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Jelaskan fasilitas, keunggulan, dan daya tarik properti Anda..."
                    />
                  </div>

                  {/* Property Picture */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Foto Properti Utama
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                          <div className="px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-center">
                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="text-sm text-gray-500">PNG, JPG (Maks. 5MB)</span>
                      </div>
                      
                      {previewImage && (
                        <div className="relative w-full max-w-md h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
                            className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Tipe Kamar</h2>
                      <p className="text-gray-500 text-sm">Kelola berbagai tipe kamar yang tersedia</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    {values.roomTypes.length} kamar
                  </div>
                </div>

                <FieldArray name="roomTypes">
                  {({ remove, push }) => (
                    <div className="space-y-6">
                      {values.roomTypes.map((room, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-white transition-all duration-300 group"
                        >
                          {/* Room Header */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Tipe Kamar {index + 1}</h3>
                            </div>
                            {values.roomTypes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Room Form Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Room Name */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Tipe Kamar <span className="text-red-500">*</span>
                              </label>
                              <Field
                                name={`roomTypes.${index}.roomName`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Contoh: Deluxe Room, Suite Executive"
                              />
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga per Malam <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.price`}
                                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  placeholder="750000"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Capacity Grid */}
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Kuota <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.quota`}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  min="1"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Dewasa <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.adultQty`}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  min="1"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Anak</label>
                                <Field
                                  type="number"
                                  name={`roomTypes.${index}.childQty`}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Room Image */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Foto Kamar
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                onChange={(e) =>
                                  setFieldValue(
                                    `roomTypes.${index}.roomImg`,
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi Kamar
                              </label>
                              <Field
                                as="textarea"
                                name={`roomTypes.${index}.description`}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
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
                            roomImg: null,
                          })
                        }
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium">Tambah Tipe Kamar Baru</span>
                        </div>
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
      </div>
    </div>
    </ProtectedPage>
  );
}