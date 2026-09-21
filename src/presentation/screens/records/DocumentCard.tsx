import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, View } from 'react-native';

import { useDeleteDocumentMutation, useLazyGetDocumentLinkQuery } from '@/data/api/documentApi';
import type { AppDocument } from '@/domain/entities';
import { formatFileSize } from '@/domain/usecases/validation';
import { AppText, Button, Card, EmojiTile } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { useTheme } from '../../theme/useTheme';
import { formatDate } from '../../utils/format';

export function DocumentCard({ doc }: { doc: AppDocument }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const language = useAppSelector(selectLanguage);
  const [getLink, { isFetching: opening }] = useLazyGetDocumentLinkQuery();
  const [remove, { isLoading: removing }] = useDeleteDocumentMutation();

  // A short-lived signed URL lets the system viewer open the file without our auth header.
  const view = async () => {
    try {
      await Linking.openURL(await getLink(doc.id).unwrap());
    } catch {
      Alert.alert(t('documents.openFailed'));
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('documents.deleteTitle'), t('documents.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('documents.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(doc.id).unwrap();
          } catch (e) {
            Alert.alert(errorMessage(e));
          }
        },
      },
    ]);

  const meta = [t(`documents.categories.${doc.category}`), doc.petName, formatDate(doc.createdAt.slice(0, 10), language), formatFileSize(doc.sizeBytes)].filter(Boolean).join(' · ');

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <EmojiTile emoji={doc.mimeType?.startsWith('image/') ? '🖼️' : '📄'} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="subheading" numberOfLines={2}>{doc.title}</AppText>
          <AppText variant="caption" color="textMuted">{meta}</AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('documents.delete')} onPress={confirmDelete} disabled={removing} hitSlop={10}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      </View>
      {doc.notes ? <AppText variant="caption" color="textSecondary">{doc.notes}</AppText> : null}
      <Button title={t('documents.view')} icon="open-outline" variant="outline" compact loading={opening} onPress={view} />
    </Card>
  );
}
