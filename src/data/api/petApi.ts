import type { Pet, PetInput } from '@/domain/entities';
import type { PetDto } from '../dto';
import { fromPetInput, toPet } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export const petApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPets: build.query<Pet[], void>({
      query: () => '/pets?limit=100',
      transformResponse: unwrap((rows: PetDto[]) => rows.map(toPet)),
      providesTags: (pets) => [
        { type: 'Pet', id: 'LIST' },
        ...(pets ?? []).map((p) => ({ type: 'Pet' as const, id: p.id })),
      ],
    }),
    getPet: build.query<Pet, number>({
      query: (id) => `/pets/${id}`,
      transformResponse: unwrap(toPet),
      providesTags: (_r, _e, id) => [{ type: 'Pet', id }],
    }),
    addPet: build.mutation<Pet, PetInput>({
      query: (pet) => ({ url: '/pets', method: 'POST', body: fromPetInput(pet) }),
      transformResponse: unwrap(toPet),
      invalidatesTags: [{ type: 'Pet', id: 'LIST' }],
    }),
    updatePet: build.mutation<Pet, { id: number; changes: Partial<PetInput> }>({
      query: ({ id, changes }) => ({ url: `/pets/${id}`, method: 'PUT', body: fromPetInput(changes) }),
      transformResponse: unwrap(toPet),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Pet', id }, { type: 'Pet', id: 'LIST' }],
    }),
    deletePet: build.mutation<void, number>({
      query: (id) => ({ url: `/pets/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Pet', id }, { type: 'Pet', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPetsQuery,
  useGetPetQuery,
  useAddPetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
} = petApi;
