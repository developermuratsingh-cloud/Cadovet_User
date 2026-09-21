import { useTranslation } from 'react-i18next';

import { Screen } from '../../components';
import { DocumentSection } from './DocumentSection';

// Lab reports are documents you (or the clinic) upload; the backend keeps them per customer.
export default function LabReportsScreen() {
  const { t } = useTranslation();
  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <DocumentSection category="LAB_REPORT" emptyMessage={t('medical.noReports')} uploadLabel={t('medical.uploadReport')} />
    </Screen>
  );
}
