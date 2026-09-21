import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { BlogPost } from '@/domain/entities';
import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectLanguage } from '../state/selectors/languageSelectors';
import { useTheme } from '../theme/useTheme';
import { formatDate } from '../utils/format';
import { AppText } from './AppText';
import { Card } from './Card';

interface Props {
  post: BlogPost;
  onPress: () => void;
  width?: number; // set for horizontal carousels
}

export function BlogCard({ post, onPress, width }: Props) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);

  return (
    <Card onPress={onPress} style={{ padding: 0, gap: 0, overflow: 'hidden', width }}>
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: width ? 130 : 170, backgroundColor: colors.primaryLight }} contentFit="cover" transition={200} accessibilityLabel={post.title} />
      ) : null}
      <View style={{ padding: 14, gap: 6 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 2 }}>
          <AppText variant="caption" color="primaryDark" style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11 }}>{post.category}</AppText>
        </View>
        <AppText variant="subheading" numberOfLines={width ? 3 : 2}>{post.title}</AppText>
        {!width && post.excerpt ? <AppText variant="caption" color="textSecondary" numberOfLines={3}>{post.excerpt}</AppText> : null}
        <AppText variant="caption" color="textMuted">
          {formatDate(post.publishedAt, language)}  ·  {t('blog.readTime', { count: post.readMinutes })}
        </AppText>
      </View>
    </Card>
  );
}
