export type GroupBy = "property" | "transaction" | "user";
export type SortBy = "revenue" | "date";
export type Order = "asc" | "desc";

export type Summary = {
  totalRevenue: number;
  countTransaction: number;
  byMethod: {
    TRANSFER: { revenue: number; count: number };
    MIDTRANS: { revenue: number; count: number };
  };
};

export type ApiParams = {
  dateFrom: string | null;
  dateTo: string | null;
  groupBy: GroupBy;
  sortBy: SortBy;
  order: Order;
  page: number;
  limit: number;
  propertyId: number | null;
};

export type ItemTxn = {
  transactionId: number;
  orderNumber: string;
  paidAt: string | null;
  method: "TRANSFER" | "MIDTRANS";
  amount: number;
  property?: { id: number; name: string; city: string };
  roomName?: string | null;
  user?: { id: number; username: string | null; email: string | null };
};

export type ItemGroup = {
  revenue: number;
  countTransaction: number;
  byMethod: Summary["byMethod"];
  key:
    | { propertyId: number; name: string; city: string }
    | { userId: number; username: string | null; email: string | null };
  latestPaidAt: string | null;
};

export type ApiResp =
  | {
      params: ApiParams;
      summary: Summary;
      total: number;
      totalPages: number;
      items: ItemTxn[];
    }
  | {
      params: ApiParams;
      summary: Summary;
      total: number;
      totalPages: number;
      items: ItemGroup[];
    };

export type PerDate = {
  date: string;
  quota: number;
  reserved: number;
  remaining: number;
  status: "AVAILABLE" | "FULL";
  isPeakSeason: boolean;
};

export type RoomReport = {
  roomTypeId: number;
  roomName: string;
  quota: number;
  property: { id: number; name: string; city: string };
  perDate: PerDate[];
};

export type Property = { id: number; name: string; city: string };
export type RoomType = { id: number; roomName: string };

export type ApiRespProperty = { items: RoomReport[] };
