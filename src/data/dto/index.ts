// Raw shapes returned by cadovet-server. Postgres NUMERIC columns arrive as strings.

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginDto {
  token: string;
  refreshToken: string;
  user: { id: number; name: string; email: string | null; mobile: string | null };
}

export interface RefreshDto {
  token: string;
  refreshToken: string;
}

export interface MeDto {
  id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  role_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  permissions: string[];
}

export interface PetDto {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN' | null;
  date_of_birth: string | null;
  weight: string | null;
  color: string | null;
  blood_group: string | null;
  is_neutered: boolean | null;
  is_vaccinated: boolean | null;
  allergies: string | null;
  notes: string | null;
}

export interface ServiceDto {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: string;
  duration_minutes: number | null;
}

export interface DoctorDto {
  id: number;
  name: string;
  specialization: string;
  qualification: string | null;
  experience_years: number | null;
  consultation_fee: string | null;
  rating: string | null;
  bio: string | null;
}

export interface AppointmentDto {
  id: number;
  pet_id: number;
  pet_name: string;
  doctor_id: number | null;
  doctor_name: string | null;
  service_id: number | null;
  service_name: string | null;
  service_price: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  coupon_code: string | null;
  discount_amount: string | null;
}

export interface SlotsDto {
  date: string;
  doctor_id: number;
  slots: { time: string; available: boolean }[];
}

export interface PrescriptionDto {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration_days: number | null;
  instructions: string | null;
}

export interface MedicalRecordDto {
  id: number;
  pet_id: number;
  pet_name: string;
  doctor_name: string | null;
  visit_date: string;
  symptoms: string | null;
  diagnosis: string | null;
  treatment_notes: string | null;
  temperature_f: string | null;
  weight_kg: string | null;
  follow_up_date: string | null;
  prescriptions: PrescriptionDto[] | null;
}

export interface InvoiceDto {
  id: number;
  invoice_number: string;
  pet_name: string | null;
  service_name: string | null;
  subtotal: string;
  tax: string;
  discount: string;
  total_amount: string;
  payment_status: 'PAID' | 'PENDING' | 'CANCELLED';
  payment_method: string | null;
  invoice_date: string;
}

export interface BlogDto {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string | null;
  excerpt: string | null;
  content?: string | null;
  image_url: string | null;
  read_minutes: number | null;
  published_at: string;
}

export interface DocumentDto {
  id: number;
  category: 'PRESCRIPTION' | 'LAB_REPORT' | 'VACCINATION' | 'OTHER';
  title: string;
  notes: string | null;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  pet_id: number | null;
  pet_name: string | null;
  created_at: string;
}

export interface CouponDto {
  code: string;
  title: string;
  description: string | null;
  discount_type: 'PERCENT' | 'FLAT';
  discount_value: string;
  min_amount: string | null;
  max_discount: string | null;
  valid_until: string | null;
}

export interface CouponQuoteDto {
  code: string;
  title: string;
  original: number;
  discount: number;
  payable: number;
}

export interface MembershipOfferDto {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  pet_type: 'Dogs' | 'Cats';
  price: string;
  original_price: string | null;
  badge: string | null;
  description: string | null;
  inclusions: string[];
  image_url: string | null;
  rating: string | null;
  reviews_count: number | null;
}

export interface ReferralDto {
  code: string;
  friends_joined: number;
  friend_coupon: { code: string; title: string; discount_type: 'PERCENT' | 'FLAT'; discount_value: string } | null;
}

export interface PublicBookingDto {
  appointment_id: number;
  appointment_date: string;
  appointment_time: string;
  pet_name: string;
  customer_name: string;
}
