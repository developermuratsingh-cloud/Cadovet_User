export interface Service {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  durationMinutes: number | null;
}
