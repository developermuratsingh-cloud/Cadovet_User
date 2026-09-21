import type { Service } from '@/domain/entities';
import type { ServiceDto } from '../dto';
import { toService } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServices: build.query<Service[], void>({
      query: () => '/services',
      transformResponse: unwrap((rows: ServiceDto[]) => rows.map(toService)),
    }),
  }),
});

export const { useGetServicesQuery } = serviceApi;
