import type { Coupon, CouponQuote, MembershipOffer, Referral } from '@/domain/entities';
import type { CouponDto, CouponQuoteDto, MembershipOfferDto, ReferralDto } from '../dto';
import { toCoupon, toCouponQuote, toMembershipOffer, toReferral } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const offersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCoupons: build.query<Coupon[], void>({
      query: () => '/coupons',
      transformResponse: unwrap((rows: CouponDto[]) => rows.map(toCoupon)),
    }),
    // The backend prices the service itself; the client only says which coupon and which service.
    validateCoupon: build.mutation<CouponQuote, { code: string; serviceId: number }>({
      query: ({ code, serviceId }) => ({ url: '/coupons/validate', method: 'POST', body: { code, service_id: serviceId } }),
      transformResponse: unwrap((d: CouponQuoteDto) => toCouponQuote(d)),
    }),
    getMembershipOffers: build.query<MembershipOffer[], void>({
      query: () => '/membership-offers',
      transformResponse: unwrap((rows: MembershipOfferDto[]) => rows.map(toMembershipOffer)),
    }),
    getMyReferral: build.query<Referral, void>({
      query: () => '/referrals/me',
      transformResponse: unwrap((d: ReferralDto) => toReferral(d)),
      providesTags: ['Referral'],
    }),
  }),
});

export const { useGetCouponsQuery, useValidateCouponMutation, useGetMembershipOffersQuery, useGetMyReferralQuery } = offersApi;
