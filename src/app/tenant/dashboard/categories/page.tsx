"use client";

import { Suspense, useEffect, useState } from "react";

export const dynamic = 'force-dynamic';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Search, FolderOpen, Loader2 } from "lucide-react";
import AddCategoryModal from "./addModal";
import EditCategoryModal from "./editModal";
import ProtectedPage from "@/components/protectedPage";

interface PropertyCategory {
  id: number;
  category: string;
}

export default function PropertyCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCategories = async () => {
    try {
      const res = await axios.get<PropertyCategory[]>(`${API_URL}/api/properties/dashboard/categories`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
    
    setDeleteLoading(id);
    try {
      await axios.delete<PropertyCategory[]>(`${API_URL}/api/properties-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedPage role="TENANT">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Property Categories</h1>
                  <p className="text-gray-600 mt-1">Manage and organize your property categories</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAddOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 px-6 py-3 h-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Category
            </Button>
          </div>
        </div>

        {/* Stats & Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                <div className="text-sm text-gray-500">Total Categories</div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{filteredCategories.length}</div>
                <div className="text-sm text-gray-500">Showing</div>
              </div>
            </div>

            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-700">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">Category Name</div>
              <div className="col-span-4">Created Date</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-blue-50/30 transition-colors duration-200 group"
                >
                  <div className="col-span-1 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold">
                      {cat.id}
                    </span>
                  </div>
                  
                  <div className="col-span-4 flex items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{cat.category}</div>
                        <div className="text-sm text-gray-500">Property Category</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-4 flex items-center">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{new Date(cat.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                      <div className="text-gray-400">
                        {new Date(cat.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsEditOpen(true);
                      }}
                      className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleteLoading === cat.id}
                      className="transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      {deleteLoading === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No categories found" : "No categories yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm 
                    ? `No categories matching "${searchTerm}" were found. Try a different search term.`
                    : "Get started by creating your first property category to organize your properties."
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Category
                  </Button>
                )}
                {searchTerm && (
                  <Button 
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-gray-300 hover:border-gray-400"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        {filteredCategories.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredCategories.length} of {categories.length} categories
              {searchTerm && (
                <span className="text-blue-600 ml-1">
                  for &quot;{searchTerm}&quot;
                </span>
              )}
            </p>
          </div>
        )}

        {/* Modals */}
        <AddCategoryModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={fetchCategories}
        />

        <EditCategoryModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          category={selectedCategory}
          onSuccess={fetchCategories}
        />
          </div>
        </div>
      </ProtectedPage>
    </Suspense>
  );
}
