import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetInvoicesQuery } from '@/data/api/invoiceApi';
import type { PaymentStatus } from '@/domain/entities';
import { AppText, AsyncBoundary, Card, Screen, StatusBadge } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatCurrency, formatDate } from '../../utils/format';

const tone = (s: PaymentStatus) => ({ PAID: 'success', PENDING: 'warning', CANCELLED: 'danger' } as const)[s];

export default function InvoicesScreen() {
  const { t } = useTranslation();
  const language = useAppSelector(selectLanguage);
  const query = useGetInvoicesQuery();

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('invoices.empty')}>
        {(invoices) =>
          invoices.map((inv) => (
            <Card key={inv.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="subheading">{inv.invoiceNumber}</AppText>
                <StatusBadge label={t(`invoices.status.${inv.paymentStatus}`)} tone={tone(inv.paymentStatus)} />
              </View>
              <AppText color="textSecondary">
                {[formatDate(inv.invoiceDate, language), inv.serviceName ?? inv.petName].filter(Boolean).join(' · ')}
              </AppText>
              {inv.discount > 0 ? <AppText variant="caption" color="textSecondary">{t('invoices.discount')}: {formatCurrency(inv.discount, language)}</AppText> : null}
              <AppText variant="heading" color="primary">{formatCurrency(inv.total, language)}</AppText>
            </Card>
          ))
        }
      </AsyncBoundary>
    </Screen>
  );
}
