export type TransactionStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_CONFIRMATION"
  | "ACCEPTED"
  | "CANCELLED";

export type PaymentMethod = "TRANSFER" | "MIDTRANS";

export interface UserOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: number;
  qty: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  property: {
    id: number;
    name: string;
    city: string;
  } | null;
  roomName: string | null;
  payment: {
    id: number;
    method: string;
    status: string;
    paymentUrl: string | null;
    paymentProof: string | null;
    createdAt: string;
  } | null;
}

export interface UserOrderResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: UserOrder[];
}

// src/lib/types.ts
export interface UserOrderDetail {
  id: number;
  status:
    | "WAITING_FOR_PAYMENT"
    | "WAITING_FOR_CONFIRMATION"
    | "ACCEPTED"
    | "CANCELLED";
  qty: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  roomType: {
    roomName: string | null;
    property: {
      id: number;
      name: string;
      city: string;
      address: string;
      userId: number;
      noRekening?: string | null;
      destinationBank?: string | null;
    } | null;
  } | null;
  payment: {
    id: number;
    method: "TRANSFER" | "MIDTRANS";
    paymentStatus: string | null;
    paymentUrl: string | null;
    paymentProof: string | null;
    paidAt: string | null;
    createdAt: string;
  } | null;
}

export interface UserOrderDetailResponse {
  message: string;
  data: UserOrderDetail;
}
