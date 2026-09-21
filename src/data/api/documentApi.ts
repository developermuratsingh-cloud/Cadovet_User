import { Platform } from 'react-native';

import { API_BASE_URL, API_ORIGIN } from '@/core/config/env';
import type { ApiError } from '@/core/errors';
import type { RootState } from '@/presentation/state/store';
import type { AppDocument, DocumentCategory, DocumentUpload } from '@/domain/entities';
import type { ApiEnvelope, DocumentDto } from '../dto';
import { toDocument } from '../mappers';
import { baseApi, unwrap } from './baseApi';

const buildForm = ({ file, category, title, petId, notes }: DocumentUpload): FormData => {
  const form = new FormData();
  if (Platform.OS === 'web' && file.webFile) {
    form.append('file', file.webFile, file.name);
  } else {
    // React Native's legacy local-file part, understood by its XMLHttpRequest.
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  }
  form.append('category', category);
  form.append('title', title.trim());
  if (petId !== null) form.append('pet_id', String(petId));
  if (notes.trim()) form.append('notes', notes.trim());
  return form;
};

const UPLOAD_TIMEOUT_MS = 90_000; // large files on slow connections

// Multipart upload over XMLHttpRequest. Expo SDK 57's global fetch only accepts Blob/File parts and cannot read the
// picker's cache files ("Unsupported FormDataPart implementation" / missing READ permission in Expo Go), whereas
// React Native's XHR uploads { uri, name, type } parts natively and browsers' XHR handles File parts.
const xhrUpload = (url: string, form: FormData, token: string | null) =>
  new Promise<{ status: number; body: { data?: DocumentDto; message?: string; errors?: string[] } | null }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON error page; the status code still tells the story
      }
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(Object.assign(new Error('Upload timed out'), { name: 'TimeoutError' }));
    xhr.send(form);
  });

export const documentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDocuments: build.query<AppDocument[], DocumentCategory | undefined>({
      query: (category) => (category ? `/documents?category=${category}` : '/documents'),
      transformResponse: unwrap((rows: DocumentDto[]) => rows.map(toDocument)),
      providesTags: (docs) => [{ type: 'Document', id: 'LIST' }, ...(docs ?? []).map((d) => ({ type: 'Document' as const, id: d.id }))],
    }),
    uploadDocument: build.mutation<AppDocument, DocumentUpload>({
      queryFn: async (upload, api, _extra, baseQuery) => {
        // A cheap authenticated call first: if the access token expired, baseApi refreshes it (or signs the user out).
        const ping = await baseQuery({ url: '/auth/me' });
        if (ping.error) return { error: ping.error };

        try {
          const token = (api.getState() as RootState).auth.accessToken;
          const { status, body } = await xhrUpload(`${API_BASE_URL}/documents`, buildForm(upload), token);
          if (status < 200 || status >= 300 || !body?.data) {
            const error: ApiError = { status, message: body?.message ?? body?.errors?.[0] ?? '' };
            return { error };
          }
          return { data: toDocument(body.data) };
        } catch (e) {
          const timedOut = e instanceof Error && e.name === 'TimeoutError';
          const error: ApiError = { status: timedOut ? 'TIMEOUT' : 'NETWORK', message: __DEV__ && !timedOut ? String(e) : '' };
          return { error };
        }
      },
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),
    deleteDocument: build.mutation<void, number>({
      query: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),
    // Short-lived signed URL (5 min) so the system browser/viewer can open the file without an auth header.
    getDocumentLink: build.query<string, number>({
      query: (id) => `/documents/${id}/link`,
      transformResponse: (r: ApiEnvelope<{ path: string }>) => `${API_ORIGIN}${r.data.path}`,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation, useLazyGetDocumentLinkQuery } = documentApi;
