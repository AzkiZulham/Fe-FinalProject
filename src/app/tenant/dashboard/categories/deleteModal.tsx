"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";

interface PropertyCategory {
  id: number;
  category: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DeleteCategoryModal({ isOpen, onClose, category, onSuccess }: any) {
  const [isDeleting, setIsDeleting] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete<PropertyCategory[]>(`${API_URL}/api/properties-categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Category</h2>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete the category <span className="font-semibold">&quot;{category.category}&quot;</span>?
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
