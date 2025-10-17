export type TrxStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_CONFIRMATION"
  | "ACCEPTED"
  | "CANCELLED";

export type PaymentMethod = "TRANSFER" | "MIDTRANS";

export type TenantOrderItem = {
  id: number;
  orderNumber: string;
  status: TrxStatus;
  totalPrice: number;
  qty: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  roomName: string | null;
  property: { id: number; name: string; city: string } | null;
  payment: {
    id: number;
    method: PaymentMethod;
    status: string | null;
    paymentUrl: string | null;
    paymentProof: string | null;
    createdAt: string;
  } | null;
};

export type TenantOrderListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: TenantOrderItem[];
};

export type TenantOrderDetail = {
  id: number;
  status: TrxStatus;
  qty: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  user?: {
    id: number;
    email: string | null;
    username?: string | null;
    phoneNumber?: string | null;
  } | null;
  roomType: {
    roomName: string | null;
    property: {
      id: number;
      name: string;
      city: string;
      address: string;
      userId: number;
    };
  } | null;
  payment: {
    id: number;
    method: PaymentMethod;
    paymentStatus: string | null;
    paymentUrl: string | null;
    paymentProof: string | null;
    paidAt: string | null;
    createdAt: string;
  } | null;
};
