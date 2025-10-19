"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import Select, { SingleValue } from "react-select";

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface OptionType {
  value: number;
  label: string;
}

export default function CreateRoomPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/properties/dashboard/my`, {
          params: { perPage: 100 },
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const userProperties = res.data.data || [];
        setProperties(userProperties);

        if (propertyId) {
          setSelectedPropertyId(Number(propertyId));
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
        alert("Gagal memuat data properti");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProperties();
  }, [API_URL, token, propertyId]);

  const handleBack = () => router.push("/tenant/dashboard/rooms");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            Memuat data properti...
          </p>
        </div>
      </div>
    );
  }

  const propertyOptions: OptionType[] = properties.map((p) => ({
    value: p.id,
    label: `${p.name}`,
  }));

  const selectedOption =
    propertyOptions.find((opt) => opt.value === selectedPropertyId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">
              Kembali ke Room List
            </span>
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-md" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Add New Room
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Pilih properti dan lengkapi informasi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <Formik
            initialValues={{
              roomName: "",
              price: "",
              description: "",
              quota: "",
              adultQty: "",
              childQty: "",
              roomImg: [] as File[],
            }}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              if (!selectedPropertyId) {
                alert("Silakan pilih properti terlebih dahulu");
                setSubmitting(false);
                return;
              }

              try {
                const formData = new FormData();
                formData.append("roomName", values.roomName);
                formData.append("price", values.price);
                formData.append("description", values.description);
                formData.append("quota", values.quota);
                formData.append("adultQty", values.adultQty);
                formData.append("childQty", values.childQty);
                if (values.roomImg && values.roomImg.length > 0) {
                  values.roomImg.forEach((file, index) => {
                    formData.append(`roomImg_${index}`, file);
                  });
                }
                formData.append("propertyId", selectedPropertyId.toString());

                await axios.post(`${API_URL}/api/rooms`, formData, {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "multipart/form-data",
                  },
                });

                alert("Kamar berhasil ditambahkan!");
                resetForm();
                setSelectedPropertyId(null);
                router.push("/tenant/dashboard/rooms");
              } catch (err) {
                console.error("Gagal menambahkan kamar:", err);
                alert("Gagal menambahkan kamar");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ setFieldValue, isSubmitting, values }) => (
              <Form className="space-y-8">
                {/* Property Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Properti <span className="text-red-500">*</span>
                  </label>
                  <Select<OptionType, false>
                    value={selectedOption}
                    onChange={(selected: SingleValue<OptionType>) =>
                      setSelectedPropertyId(selected ? selected.value : null)
                    }
                    options={propertyOptions}
                    placeholder="-- Pilih Properti --"
                    className="w-full text-sm sm:text-base"
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        width: "100%",
                        left: 0,
                        right: 0,
                      }),
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                        borderRadius: "10px",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px #3b82f680"
                          : "none",
                        "&:hover": { borderColor: "#3b82f6" },
                        minHeight: "40px",
                        backgroundColor: "#fff",
                      }),
                    }}
                    menuPlacement="auto"
                    menuPosition="absolute"
                  />
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Nama Room <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="roomName"
                      as="input"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      placeholder="Contoh: Deluxe Room dengan View Pantai"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Harga per Malam <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <Field
                        name="price"
                        as="input"
                        type="number"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                        placeholder="500000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Kuota Kamar <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="quota"
                      as="input"
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Jumlah Dewasa <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="adultQty"
                      as="input"
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      placeholder="2"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Jumlah Anak
                    </label>
                    <Field
                      name="childQty"
                      as="input"
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Deskripsi Kamar
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-sm sm:text-base"
                      placeholder="Jelaskan fasilitas dan pengalaman menginap di kamar ini..."
                    />
                  </div>

                  {/* Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      Gambar Kamar (Multiple)
                    </label>

                    {/* Display selected images */}
                    {values.roomImg && values.roomImg.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                          Gambar yang dipilih ({values.roomImg.length}):
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {values.roomImg.map((file: File, index: number) => (
                            <div key={index} className="relative">
                              <div className="relative w-full h-24 border border-gray-300 rounded-lg overflow-hidden">
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFiles = values.roomImg.filter((_: File, i: number) => i !== index);
                                    setFieldValue("roomImg", newFiles);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-gray-50">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-semibold">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        PNG, JPG, JPEG (Maks. 5MB per gambar, maks. 10 gambar)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.currentTarget.files || []);
                          const validFiles = files.filter(file => {
                            if (file.size > 5 * 1024 * 1024) {
                              alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
                              return false;
                            }
                            return true;
                          });

                          const currentFiles = values.roomImg || [];
                          if (currentFiles.length + validFiles.length > 10) {
                            alert("Maksimal 10 gambar per kamar.");
                            return;
                          }

                          setFieldValue("roomImg", [...currentFiles, ...validFiles]);
                        }}
                        className="hidden"
                      />
                    </label>

                    {values.roomImg && values.roomImg.length > 0 && (
                      <p className="text-sm text-green-600 mt-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {values.roomImg.length} file{values.roomImg.length > 1 ? 's' : ''} dipilih
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
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
                    disabled={isSubmitting || !selectedPropertyId}
                    className="w-full sm:w-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Simpan Kamar Baru
                      </>
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
