import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput } from 'react-native';

import { useGetMeQuery, useUpdateMeMutation } from '@/data/api/userApi';
import { validateName, validateOptionalText, validatePincode } from '@/domain/usecases/validation';
import { Button, LoadingView, Screen, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';

const validators = {
  name: validateName,
  address: validateOptionalText(200),
  city: validateOptionalText(60),
  state: validateOptionalText(60),
  pincode: validatePincode,
};

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const { data } = useGetMeQuery();
  const [update, { isLoading }] = useUpdateMeMutation();
  const form = useForm({ name: '', address: '', city: '', state: '', pincode: '' }, validators);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const pincodeRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    form.reset({ name: p.name, address: p.address ?? '', city: p.city ?? '', state: p.state ?? '', pincode: p.pincode ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) return <LoadingView />;

  const submit = form.handleSubmit(async (v) => {
    try {
      await update({ name: v.name.trim(), address: v.address.trim(), city: v.city.trim(), state: v.state.trim(), pincode: v.pincode.trim() }).unwrap();
      Alert.alert(t('profile.saved'));
      router.back();
    } catch (e) {
      Alert.alert(errorMessage(e));
    }
  });

  return (
    <Screen edges={['left', 'right', 'bottom']} footer={<Button title={t('common.save')} icon="checkmark" onPress={submit} loading={isLoading} />}>
      <TextField {...form.fieldProps('name')} label={`${t('profile.name')} *`} icon="person-outline" maxLength={60} autoCapitalize="words" />
      <TextField {...form.fieldProps('address')} label={t('profile.address')} icon="home-outline" multiline maxLength={200} showCounter />
      <TextField {...form.fieldProps('city')} inputRef={cityRef} label={t('profile.city')} maxLength={60} returnKeyType="next" onSubmitEditing={() => stateRef.current?.focus()} />
      <TextField {...form.fieldProps('state')} inputRef={stateRef} label={t('profile.state')} maxLength={60} returnKeyType="next" onSubmitEditing={() => pincodeRef.current?.focus()} />
      <TextField {...form.fieldProps('pincode', (v) => v.replace(/\D/g, ''))} inputRef={pincodeRef} label={t('profile.pincode')} keyboardType="number-pad" maxLength={6} />
    </Screen>
  );
}
