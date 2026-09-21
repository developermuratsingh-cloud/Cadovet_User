import type { Invoice } from '@/domain/entities';
import type { InvoiceDto } from '../dto';
import { toInvoice } from '../mappers';
import { baseApi } from './baseApi';

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<Invoice[], void>({
      query: () => '/invoices?limit=100',
      // Unlike other endpoints, the list envelope here also carries `metrics`; only `data` is needed.
      transformResponse: (r: { data: InvoiceDto[] }) => r.data.map(toInvoice),
      providesTags: ['Invoice'],
    }),
  }),
});

export const { useGetInvoicesQuery } = invoiceApi;
