/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";

const imageUrl = (rel?: string | null) => {
  if (!rel) return "";
  return `${process.env.NEXT_PUBLIC_API_URL}${
    rel.startsWith("/") ? "" : "/"
  }${rel}`;
};

export default function PaymentProofPreview({
  src,
  alt = "Payment Proof",
}: {
  src?: string | null;
  alt?: string;
}) {
  if (!src) {
    return <p className="text-sm text-gray-500">Belum ada bukti pembayaran</p>;
  }
  const url = imageUrl(src);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block"
      title="Buka gambar"
    >
      <div className="relative w-full max-w-md h-80 mx-auto border rounded-md overflow-hidden">
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-contain"
        />
      </div>
    </a>
  );
}
