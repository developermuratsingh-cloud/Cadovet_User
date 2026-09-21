import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import type { PickedFile } from '@/domain/entities';

const EXT_TYPES: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif' };

// Some pickers omit the MIME type; fall back to the file extension.
const mimeFor = (name: string, mime?: string | null) => mime || EXT_TYPES[name.split('.').pop()?.toLowerCase() ?? ''] || 'application/octet-stream';

export type PickResult = { file: PickedFile } | { denied: true } | null;

/** PDF or image from the device's files. */
export async function pickDocument(): Promise<PickResult> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  return { file: { uri: a.uri, name: a.name, mimeType: mimeFor(a.name, a.mimeType), size: a.size ?? null, webFile: Platform.OS === 'web' ? a.file : undefined } };
}

const fromImageAsset = (a: ImagePicker.ImagePickerAsset): PickedFile => {
  const name = a.fileName ?? `photo-${Date.now()}.jpg`;
  return { uri: a.uri, name, mimeType: mimeFor(name, a.mimeType), size: a.fileSize ?? null };
};

/** Photo from the library. */
export async function pickFromGallery(): Promise<PickResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { denied: true };
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  return res.canceled || !res.assets[0] ? null : { file: fromImageAsset(res.assets[0]) };
}

/** Photo taken with the camera (e.g. a printed prescription). */
export async function takePhoto(): Promise<PickResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { denied: true };
  const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  return res.canceled || !res.assets[0] ? null : { file: fromImageAsset(res.assets[0]) };
}
