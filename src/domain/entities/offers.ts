export interface Coupon {
  code: string;
  title: string;
  description: string | null;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minAmount: number;
  maxDiscount: number | null;
  validUntil: string | null; // YYYY-MM-DD
}

// Result of validating a coupon against a service price (computed by the backend).
export interface CouponQuote {
  code: string;
  title: string;
  original: number;
  discount: number;
  payable: number;
}

export interface MembershipOffer {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  petType: 'Dogs' | 'Cats';
  price: number;
  originalPrice: number | null;
  badge: string | null;
  description: string | null;
  inclusions: string[];
  imageUrl: string | null;
  rating: number | null;
  reviewsCount: number;
}

export interface Referral {
  code: string;
  friendsJoined: number;
  friendCoupon: { code: string; title: string; discountType: 'PERCENT' | 'FLAT'; discountValue: number } | null;
}
