// components/properties/ReviewList.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {  User, CheckCircle } from "lucide-react";
import type { Review } from "./types";

interface Props {
  reviews: Review[];
}

const ReviewList: React.FC<Props> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Ulasan</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Jadilah yang pertama memberikan ulasan untuk properti ini dan bagikan pengalaman Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Ulasan Pengunjung</h3>
        
        <div className="grid gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-lg">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      {review.verified && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Load More Button (if needed) */}
      {reviews.length > 5 && (
        <div className="text-center">
          <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium">
            Tampilkan Lebih Banyak Ulasan
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;