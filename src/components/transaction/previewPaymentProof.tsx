/* eslint-disable @next/next/no-img-element */
"use client";

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
      <img
        src={url}
        alt={alt}
        className="max-h-80 w-auto rounded-md border object-contain mx-auto"
      />
    </a>
  );
}
