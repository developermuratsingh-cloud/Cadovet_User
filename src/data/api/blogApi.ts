import type { BlogPost } from '@/domain/entities';
import type { BlogDto } from '../dto';
import { toBlogPost } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBlogs: build.query<BlogPost[], void>({
      query: () => '/blogs?limit=20',
      transformResponse: unwrap((rows: BlogDto[]) => rows.map(toBlogPost)),
    }),
    getBlog: build.query<BlogPost, string>({
      query: (slug) => `/blogs/${encodeURIComponent(slug)}`,
      transformResponse: unwrap(toBlogPost),
    }),
  }),
});

export const { useGetBlogsQuery, useGetBlogQuery } = blogApi;
