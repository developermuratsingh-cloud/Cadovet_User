import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useGetBlogsQuery } from '@/data/api/blogApi';
import { AsyncBoundary, BlogCard, Screen } from '../../components';

export default function BlogListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useGetBlogsQuery();

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('blog.empty')}>
        {(posts) => posts.map((p) => <BlogCard key={p.id} post={p} onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: p.slug } })} />)}
      </AsyncBoundary>
    </Screen>
  );
}
