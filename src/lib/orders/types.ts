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
