export type PaymentStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  petName: string | null;
  serviceName: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  invoiceDate: string; // YYYY-MM-DD
}
