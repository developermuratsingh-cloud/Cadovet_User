import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useGetDocumentsQuery } from '@/data/api/documentApi';
import type { DocumentCategory } from '@/domain/entities';
import { AsyncBoundary, Button } from '../../components';
import { DocumentCard } from './DocumentCard';

interface Props {
  category?: DocumentCategory;
  petId?: number | null;
  emptyMessage: string;
  uploadLabel?: string;
}

// The user's uploaded documents (optionally one category / pet) with an upload shortcut.
export function DocumentSection({ category, petId = null, emptyMessage, uploadLabel }: Props) {
  const router = useRouter();
  const query = useGetDocumentsQuery(category);

  return (
    <>
      {uploadLabel ? (
        <Button title={uploadLabel} icon="cloud-upload-outline" variant="success" onPress={() => router.push({ pathname: '/records/upload', params: category ? { category } : {} })} />
      ) : null}
      <AsyncBoundary {...query} isEmpty={(d) => d.filter((x) => petId === null || x.petId === petId).length === 0} emptyMessage={emptyMessage}>
        {(docs) => docs.filter((d) => petId === null || d.petId === petId).map((d) => <DocumentCard key={d.id} doc={d} />)}
      </AsyncBoundary>
    </>
  );
}
