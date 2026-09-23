import type { Appointment, AppointmentInput, TimeSlot } from '@/domain/entities';
import type { AppointmentDto, SlotsDto } from '../dto';
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
          service_id: a.serviceId,
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
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} = appointmentApi;
