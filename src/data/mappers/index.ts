import type { AppDocument, Appointment, BlogPost, Coupon, CouponQuote, MembershipOffer, Referral, MedicalRecord, Pet, PetInput, Service, Doctor, Invoice, TimeSlot, UserProfile } from '@/domain/entities';
import type {
  AppointmentDto,
  BlogDto,
  CouponDto,
  CouponQuoteDto,
  DocumentDto,
  MembershipOfferDto,
  ReferralDto,
  DoctorDto,
  InvoiceDto,
  MeDto,
  MedicalRecordDto,
  PetDto,
  ServiceDto,
  SlotsDto,
} from '../dto';

const num = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Defensive: accepts 'YYYY-MM-DD' or a full ISO string and keeps only the calendar date.
const day = (v: string | null | undefined): string | null => (v ? v.slice(0, 10) : null);

export const toUserProfile = (d: MeDto): UserProfile => ({
  id: d.id,
  name: d.name,
  email: d.email,
  mobile: d.mobile,
  address: d.address,
  city: d.city,
  state: d.state,
  pincode: d.pincode,
});

export const toPet = (d: PetDto): Pet => ({
  id: d.id,
  name: d.name,
  species: d.species,
  breed: d.breed,
  gender: d.gender ?? 'UNKNOWN',
  dateOfBirth: day(d.date_of_birth),
  weight: num(d.weight),
  color: d.color,
  bloodGroup: d.blood_group,
  isNeutered: !!d.is_neutered,
  isVaccinated: !!d.is_vaccinated,
  allergies: d.allergies,
  notes: d.notes,
});

export const fromPetInput = (p: Partial<PetInput>) => ({
  name: p.name,
  species: p.species,
  breed: p.breed,
  gender: p.gender,
  date_of_birth: p.dateOfBirth,
  weight: p.weight,
  color: p.color,
  blood_group: p.bloodGroup,
  is_neutered: p.isNeutered,
  is_vaccinated: p.isVaccinated,
  allergies: p.allergies,
  notes: p.notes,
});

export const toService = (d: ServiceDto): Service => ({
  id: d.id,
  name: d.name,
  category: d.category,
  description: d.description,
  price: num(d.price) ?? 0,
  durationMinutes: d.duration_minutes,
});

export const toDoctor = (d: DoctorDto): Doctor => ({
  id: d.id,
  name: d.name,
  specialization: d.specialization,
  qualification: d.qualification,
  experienceYears: d.experience_years ?? 0,
  consultationFee: num(d.consultation_fee) ?? 0,
  rating: num(d.rating) ?? 0,
  bio: d.bio,
});

export const toAppointment = (d: AppointmentDto): Appointment => ({
  id: d.id,
  petId: d.pet_id,
  petName: d.pet_name,
  doctorId: d.doctor_id,
  doctorName: d.doctor_name,
  serviceId: d.service_id,
  serviceName: d.service_name,
  servicePrice: num(d.service_price),
  date: day(d.appointment_date) ?? d.appointment_date,
  time: d.appointment_time,
  reason: d.reason,
  notes: d.notes,
  status: d.status,
  couponCode: d.coupon_code,
  discountAmount: num(d.discount_amount) ?? 0,
});

export const toTimeSlots = (d: SlotsDto): TimeSlot[] => d.slots;

export const toMedicalRecord = (d: MedicalRecordDto): MedicalRecord => ({
  id: d.id,
  petId: d.pet_id,
  petName: d.pet_name,
  doctorName: d.doctor_name,
  visitDate: day(d.visit_date) ?? d.visit_date,
  symptoms: d.symptoms,
  diagnosis: d.diagnosis,
  treatmentNotes: d.treatment_notes,
  temperatureF: num(d.temperature_f),
  weightKg: num(d.weight_kg),
  followUpDate: day(d.follow_up_date),
  prescriptions: (d.prescriptions ?? []).map((p) => ({
    id: p.id,
    medicineName: p.medicine_name,
    dosage: p.dosage,
    frequency: p.frequency,
    durationDays: p.duration_days,
    instructions: p.instructions,
  })),
});

export const toInvoice = (d: InvoiceDto): Invoice => ({
  id: d.id,
  invoiceNumber: d.invoice_number,
  petName: d.pet_name,
  serviceName: d.service_name,
  subtotal: num(d.subtotal) ?? 0,
  tax: num(d.tax) ?? 0,
  discount: num(d.discount) ?? 0,
  total: num(d.total_amount) ?? 0,
  paymentStatus: d.payment_status,
  paymentMethod: d.payment_method,
  invoiceDate: day(d.invoice_date) ?? d.invoice_date,
});

export const toBlogPost = (d: BlogDto): BlogPost => ({
  id: d.id,
  slug: d.slug,
  title: d.title,
  category: d.category,
  author: d.author,
  excerpt: d.excerpt,
  content: d.content ?? null,
  imageUrl: d.image_url,
  readMinutes: d.read_minutes ?? 3,
  publishedAt: day(d.published_at) ?? d.published_at,
});

export const toDocument = (d: DocumentDto): AppDocument => ({
  id: d.id,
  category: d.category,
  title: d.title,
  notes: d.notes,
  fileName: d.original_name,
  mimeType: d.mime_type,
  sizeBytes: d.size_bytes,
  petId: d.pet_id,
  petName: d.pet_name,
  createdAt: d.created_at,
});

export const toCoupon = (d: CouponDto): Coupon => ({
  code: d.code,
  title: d.title,
  description: d.description,
  discountType: d.discount_type,
  discountValue: num(d.discount_value) ?? 0,
  minAmount: num(d.min_amount) ?? 0,
  maxDiscount: num(d.max_discount),
  validUntil: day(d.valid_until),
});

export const toCouponQuote = (d: CouponQuoteDto): CouponQuote => ({ ...d });

export const toMembershipOffer = (d: MembershipOfferDto): MembershipOffer => ({
  id: d.id,
  slug: d.slug,
  title: d.title,
  subtitle: d.subtitle,
  petType: d.pet_type,
  price: num(d.price) ?? 0,
  originalPrice: num(d.original_price),
  badge: d.badge,
  description: d.description,
  inclusions: d.inclusions ?? [],
  imageUrl: d.image_url,
  rating: num(d.rating),
  reviewsCount: d.reviews_count ?? 0,
});

export const toReferral = (d: ReferralDto): Referral => ({
  code: d.code,
  friendsJoined: d.friends_joined,
  friendCoupon: d.friend_coupon
    ? { code: d.friend_coupon.code, title: d.friend_coupon.title, discountType: d.friend_coupon.discount_type, discountValue: num(d.friend_coupon.discount_value) ?? 0 }
    : null,
});
