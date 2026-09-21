import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetBlogQuery } from '@/data/api/blogApi';
import { AppText, AsyncBoundary, Button, Card, Screen } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { useTheme } from '../../theme/useTheme';
import { formatDate } from '../../utils/format';
import { openWhatsApp } from '../../utils/contact';

const LIST_LINE = /^\d+\.\s/;

// Article bodies are plain text: blank lines separate paragraphs, "1. " lines are list items.
function ArticleBody({ content }: { content: string }) {
  const { colors } = useTheme();
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <View style={{ gap: 12 }}>
      {lines.map((line, i) =>
        LIST_LINE.test(line) ? (
          <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
            <AppText bold color="primaryDark">{line.match(/^\d+/)![0]}.</AppText>
            <AppText style={{ flex: 1 }}>{line.replace(LIST_LINE, '')}</AppText>
          </View>
        ) : (
          <AppText key={i} style={{ color: colors.text }}>{line}</AppText>
        ),
      )}
    </View>
  );
}

export default function BlogDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = useGetBlogQuery(slug);

  return (
    <Screen edges={['left', 'right', 'bottom']} padded={false}>
      <AsyncBoundary {...query}>
        {(post) => (
          <View style={{ gap: 16 }}>
            {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 220, backgroundColor: colors.primaryLight }} contentFit="cover" accessibilityLabel={post.title} /> : null}
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 3 }}>
                <AppText variant="label" color="primaryDark">{post.category}</AppText>
              </View>
              <AppText variant="title">{post.title}</AppText>
              <AppText variant="caption" color="textMuted">
                {[post.author ? t('blog.by', { author: post.author }) : null, formatDate(post.publishedAt, language), t('blog.readTime', { count: post.readMinutes })].filter(Boolean).join('  ·  ')}
              </AppText>
              {post.content ? <ArticleBody content={post.content} /> : null}
              <Card style={{ marginVertical: 8 }}>
                <AppText variant="subheading">{t('blog.contactCta')}</AppText>
                <Button title={t('support.whatsapp')} icon="logo-whatsapp" variant="whatsapp" onPress={() => openWhatsApp(`Hello Cadovet! I read "${post.title}" and have a question about my pet.`)} />
                <Button title={t('contact.title')} variant="outline" onPress={() => router.push('/contact-support')} />
              </Card>
            </View>
          </View>
        )}
      </AsyncBoundary>
    </Screen>
  );
}
