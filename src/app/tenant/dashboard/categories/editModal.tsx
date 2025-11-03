"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PropertyCategory {
  id: number;
  category: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: any) {
  const [categoryName, setCategoryName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (category) setCategoryName(category.category);
  }, [category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put<PropertyCategory[]>(
        `${API_URL}/api/properties-categories/${category.id}`,
        { category: categoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category name"
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
