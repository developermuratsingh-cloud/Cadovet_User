import type { Doctor } from '@/domain/entities';
import type { DoctorDto } from '../dto';
import { toDoctor } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctors: build.query<Doctor[], void>({
      query: () => '/doctors',
      transformResponse: unwrap((rows: DoctorDto[]) => rows.map(toDoctor)),
    }),
  }),
});

export const { useGetDoctorsQuery } = doctorApi;
