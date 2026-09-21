import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';

import { useUploadDocumentMutation } from '@/data/api/documentApi';
import { useGetPetsQuery } from '@/data/api/petApi';
import type { DocumentCategory, PickedFile } from '@/domain/entities';
import { formatFileSize, validateFile, validateMessage, validateOptionalText } from '@/domain/usecases/validation';
import { AppText, Button, Card, Chip, Screen, SectionHeader, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { useTheme } from '../../theme/useTheme';
import { pickDocument, pickFromGallery, takePhoto, type PickResult } from '../../utils/filePicker';
import { DocumentSection } from './DocumentSection';

const CATEGORIES: DocumentCategory[] = ['PRESCRIPTION', 'LAB_REPORT', 'VACCINATION', 'OTHER'];
const DESTINATION: Record<DocumentCategory, Href | null> = {
  PRESCRIPTION: '/records/prescriptions',
  LAB_REPORT: '/records/lab-reports',
  VACCINATION: '/vaccination',
  OTHER: null,
};
const validators = { title: validateMessage(2, 120), notes: validateOptionalText(500) };

export default function UploadDocumentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const params = useLocalSearchParams<{ category?: string }>();
  const pets = useGetPetsQuery();
  const [upload, { isLoading }] = useUploadDocumentMutation();

  const [category, setCategory] = useState<DocumentCategory>(CATEGORIES.includes(params.category as DocumentCategory) ? (params.category as DocumentCategory) : 'PRESCRIPTION');
  const [petId, setPetId] = useState<number | null>(null);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [fileTouched, setFileTouched] = useState(false);
  const form = useForm({ title: '', notes: '' }, validators);

  const fileError = fileTouched ? validateFile(file) : null;

  const choose = async (picker: () => Promise<PickResult>) => {
    const res = await picker();
    if (!res) return;
    if ('denied' in res) return Alert.alert(t('upload.permissionDenied'));
    setFile(res.file);
    setFileTouched(true);
    // Suggest a title from the file name when none has been typed yet.
    if (!form.values.title.trim()) form.setValue('title', res.file.name.replace(/\.[^.]+$/, '').slice(0, 120));
  };

  const submit = () => {
    setFileTouched(true);
    if (validateFile(file) || !file) return form.handleSubmit(() => undefined)(); // still surface title errors
    return form.handleSubmit(async (v) => {
      try {
        await upload({ file, category, title: v.title, petId, notes: v.notes }).unwrap();
        Alert.alert(t('upload.done'));
        const next = DESTINATION[category];
        setFile(null);
        setFileTouched(false);
        form.reset({ title: '', notes: '' });
        if (next) router.replace(next);
      } catch (e) {
        Alert.alert(errorMessage(e));
      }
    })();
  };

  return (
    <Screen edges={['left', 'right', 'bottom']} footer={<Button title={t('upload.button')} icon="cloud-upload" onPress={submit} loading={isLoading} />}>
      <View style={{ gap: 8 }}>
        <AppText variant="label" color="textSecondary">{t('upload.type')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => <Chip key={c} label={t(`documents.categories.${c}`)} selected={c === category} onPress={() => setCategory(c)} />)}
        </View>
      </View>

      {pets.data && pets.data.length > 0 ? (
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textSecondary">{t('upload.pet')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={t('upload.noPet')} selected={petId === null} onPress={() => setPetId(null)} />
            {pets.data.map((p) => <Chip key={p.id} label={p.name} selected={petId === p.id} onPress={() => setPetId(p.id)} />)}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <AppText variant="label" color="textSecondary">{t('upload.file')} *</AppText>
        {file ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: fileError ? colors.danger : colors.border }}>
            <AppText style={{ fontSize: 26, lineHeight: 34 }}>{file.mimeType.startsWith('image/') ? '🖼️' : '📄'}</AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="subheading" numberOfLines={1}>{file.name}</AppText>
              <AppText variant="caption" color="textMuted">{formatFileSize(file.size)}</AppText>
            </View>
            <Ionicons name="close-circle" size={24} color={colors.textMuted} accessibilityLabel={t('upload.remove')} onPress={() => setFile(null)} />
          </Card>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button title={t('upload.chooseFile')} icon="document-attach-outline" variant="outline" compact onPress={() => choose(pickDocument)} />
          {Platform.OS !== 'web' ? <Button title={t('upload.takePhoto')} icon="camera-outline" variant="outline" compact onPress={() => choose(takePhoto)} /> : null}
          <Button title={t('upload.gallery')} icon="images-outline" variant="outline" compact onPress={() => choose(pickFromGallery)} />
        </View>
        {fileError ? <AppText variant="caption" color="danger" accessibilityRole="alert">{t(`validation.${fileError.code}`)}</AppText> : <AppText variant="caption" color="textMuted">{t('upload.hint')}</AppText>}
      </View>

      <TextField {...form.fieldProps('title')} label={`${t('upload.docTitle')} *`} placeholder={t('upload.titlePlaceholder')} icon="document-text-outline" maxLength={120} />
      <TextField {...form.fieldProps('notes')} label={t('upload.notes')} multiline maxLength={500} showCounter />

      <SectionHeader title={t('upload.myDocuments')} />
      <DocumentSection emptyMessage={t('medical.noDocuments')} />
    </Screen>
  );
}
