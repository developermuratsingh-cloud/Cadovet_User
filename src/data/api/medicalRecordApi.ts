import type { MedicalRecord } from '@/domain/entities';
import type { MedicalRecordDto } from '../dto';
import { toMedicalRecord } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const medicalRecordApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMedicalRecords: build.query<MedicalRecord[], void>({
      query: () => '/medical-records?limit=100',
      transformResponse: unwrap((rows: MedicalRecordDto[]) => rows.map(toMedicalRecord)),
      providesTags: ['MedicalRecord'],
    }),
    getMedicalRecord: build.query<MedicalRecord, number>({
      query: (id) => `/medical-records/${id}`,
      transformResponse: unwrap(toMedicalRecord),
      providesTags: (_r, _e, id) => [{ type: 'MedicalRecord', id }],
    }),
  }),
});

export const { useGetMedicalRecordsQuery, useGetMedicalRecordQuery } = medicalRecordApi;
