import type { Appointment, AppointmentInput, HomeVisitConfirmation, HomeVisitInput, TimeSlot } from '@/domain/entities';
import type { AppointmentDto, PublicBookingDto, SlotsDto } from '../dto';
import { toAppointment, toTimeSlots } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAppointments: build.query<Appointment[], void>({
      query: () => '/appointments?limit=100',
      transformResponse: unwrap((rows: AppointmentDto[]) => rows.map(toAppointment)),
      providesTags: (items) => [
        { type: 'Appointment', id: 'LIST' },
        ...(items ?? []).map((a) => ({ type: 'Appointment' as const, id: a.id })),
      ],
    }),
    getAppointment: build.query<Appointment, number>({
      query: (id) => `/appointments/${id}`,
      transformResponse: unwrap(toAppointment),
      providesTags: (_r, _e, id) => [{ type: 'Appointment', id }],
    }),
    // The clinic's free times for a date. The customer chooses a time; the operational head assigns the doctor later.
    getAvailability: build.query<TimeSlot[], { date: string }>({
      query: ({ date }) => `/appointments/availability?date=${date}`,
      transformResponse: unwrap(toTimeSlots as (d: SlotsDto) => TimeSlot[]),
      providesTags: ['Slots'],
    }),
    bookAppointment: build.mutation<Appointment, AppointmentInput>({
      query: (a) => ({
        url: '/appointments',
        method: 'POST',
        body: {
          pet_id: a.petId,
          ...(a.serviceId ? { service_id: a.serviceId } : {}),
          appointment_date: a.date,
          appointment_time: a.time,
          reason: a.reason,
          notes: a.notes,
          ...(a.couponCode ? { coupon_code: a.couponCode } : {}),
        },
      }),
      transformResponse: unwrap((d: AppointmentDto) => toAppointment({ ...d, pet_name: '' })),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }, 'Slots'],
    }),
    // The website's doorstep booking: owner and pet details are sent inline, and the server matches the customer by
    // mobile number, so a booking made with the account's own number shows up under that account.
    bookHomeVisit: build.mutation<HomeVisitConfirmation, HomeVisitInput>({
      query: (a) => ({
        url: '/appointments/public',
        method: 'POST',
        body: {
          owner_name: a.ownerName,
          phone: a.phone,
          ...(a.email ? { email: a.email } : {}),
          pet_name: a.petName,
          species: a.species,
          breed: a.breed,
          age_years: a.ageYears,
          gender: a.gender,
          is_aggressive: a.isAggressive,
          ...(a.serviceId ? { service_id: a.serviceId } : {}),
          service_name: a.serviceName,
          appointment_date: a.date,
          appointment_time: a.time,
          address: a.address,
          notes: a.notes,
          total_amount: a.totalAmount,
        },
      }),
      transformResponse: unwrap((d: PublicBookingDto): HomeVisitConfirmation => ({
        appointmentId: d.appointment_id,
        customerName: d.customer_name,
        petName: d.pet_name,
        date: d.appointment_date,
        time: d.appointment_time,
      })),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }, { type: 'Pet', id: 'LIST' }, 'Slots'],
    }),
    cancelAppointment: build.mutation<void, number>({
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: 'PATCH' }),
      transformResponse: () => undefined,
      invalidatesTags: (_r, _e, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }, 'Slots'],
    }),
    rescheduleAppointment: build.mutation<void, { id: number; date: string; time: string }>({
      query: ({ id, date, time }) => ({
        url: `/appointments/${id}/reschedule`,
        method: 'PATCH',
        body: { appointment_date: date, appointment_time: time },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }, 'Slots'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useGetAvailabilityQuery,
  useBookAppointmentMutation,
  useBookHomeVisitMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} = appointmentApi;
