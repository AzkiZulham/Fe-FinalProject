type GroupBy = "property" | "transaction" | "user";
type SortBy = "revenue" | "date";
type Order = "asc" | "desc";

type Summary = {
  totalRevenue: number;
  countTransaction: number;
  byMethod: {
    TRANSFER: { revenue: number; count: number };
    MIDTRANS: { revenue: number; count: number };
  };
};

type ApiParams = {
  dateFrom: string | null;
  dateTo: string | null;
  groupBy: GroupBy;
  sortBy: SortBy;
  order: Order;
  page: number;
  limit: number;
  propertyId: number | null;
};

type ItemTxn = {
  transactionId: number;
  orderNumber: string;
  paidAt: string | null;
  method: "TRANSFER" | "MIDTRANS";
  amount: number;
  property?: { id: number; name: string; city: string };
  roomName?: string | null;
  user?: { id: number; username: string | null; email: string | null };
};

type ItemGroup = {
  revenue: number;
  countTransaction: number;
  byMethod: Summary["byMethod"];
  key:
    | { propertyId: number; name: string; city: string }
    | { userId: number; username: string | null; email: string | null };
  latestPaidAt: string | null;
};

type PerDate = {
  date: string;
  quota: number;
  reserved: number;
  remaining: number;
  status: "AVAILABLE" | "FULL";
  isPeakSeason: boolean;
};

type RoomReport = {
  roomTypeId: number;
  roomName: string;
  quota: number;
  property: { id: number; name: string; city: string };
  perDate: PerDate[];
};
