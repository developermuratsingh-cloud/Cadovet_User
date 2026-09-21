export type DocumentCategory = 'PRESCRIPTION' | 'LAB_REPORT' | 'VACCINATION' | 'OTHER';

// Named AppDocument to avoid clashing with the DOM `Document` type.
export interface AppDocument {
  id: number;
  category: DocumentCategory;
  title: string;
  notes: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  petId: number | null;
  petName: string | null;
  createdAt: string; // ISO timestamp
}

// A file chosen on the device, before upload.
export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
  webFile?: File; // set on web, where the picker returns a real File
}

export interface DocumentUpload {
  file: PickedFile;
  category: DocumentCategory;
  title: string;
  petId: number | null;
  notes: string;
}
