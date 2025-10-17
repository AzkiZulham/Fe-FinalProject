"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface PropertyCategory {
  id: number;
  category: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: any) {
  const [category, setCategory] = useState("");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post<PropertyCategory[]>(`${API_URL}/api/properties-categories/add`,
        { category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
      setCategory("");
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Add Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category name"
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
