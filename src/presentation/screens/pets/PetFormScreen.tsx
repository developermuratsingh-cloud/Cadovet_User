import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, TextInput, View } from 'react-native';

import { useAddPetMutation, useGetPetQuery, useUpdatePetMutation } from '@/data/api/petApi';
import type { PetGender, PetInput } from '@/domain/entities';
import { formatDateInput, validateDateOfBirth, validateOptionalText, validateRequiredText, validateWeight } from '@/domain/usecases/validation';
import { AppText, Button, Chip, LoadingView, Screen, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { useTheme } from '../../theme/useTheme';

const BASE_SPECIES = ['Dog', 'Cat', 'Other'] as const;
const GENDERS: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];
const EMPTY = { name: '', breed: '', dob: '', weight: '', color: '', bloodGroup: '', allergies: '', notes: '' };

const validators = {
  name: validateRequiredText(40),
  breed: validateOptionalText(60),
  dob: (v: string) => validateDateOfBirth(v),
  weight: validateWeight,
  color: validateOptionalText(30),
  bloodGroup: validateOptionalText(10),
  allergies: validateOptionalText(200),
  notes: validateOptionalText(500),
};

export default function PetFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const petId = id ? Number(id) : null;
  const isEdit = petId !== null;

  const existing = useGetPetQuery(petId ?? 0, { skip: !isEdit });
  const [addPet, { isLoading: adding }] = useAddPetMutation();
  const [updatePet, { isLoading: updating }] = useUpdatePetMutation();

  const form = useForm(EMPTY, validators);
  const [species, setSpecies] = useState<string>('Dog');
  const [gender, setGender] = useState<PetGender>('UNKNOWN');
  const [neutered, setNeutered] = useState(false);
  const [vaccinated, setVaccinated] = useState(false);
  const refs = { breed: useRef<TextInput>(null), dob: useRef<TextInput>(null), weight: useRef<TextInput>(null), color: useRef<TextInput>(null), bloodGroup: useRef<TextInput>(null) };

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    form.reset({
      name: p.name,
      breed: p.breed ?? '',
      dob: p.dateOfBirth ?? '',
      weight: p.weight !== null ? String(p.weight) : '',
      color: p.color ?? '',
      bloodGroup: p.bloodGroup ?? '',
      allergies: p.allergies ?? '',
      notes: p.notes ?? '',
    });
    setSpecies(p.species);
    setGender(p.gender);
    setNeutered(p.isNeutered);
    setVaccinated(p.isVaccinated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <LoadingView />;

  const submit = form.handleSubmit(async (v) => {
    // The API updates with COALESCE, so an empty string is how a text field is cleared on edit.
    const text = (s: string) => (isEdit ? s.trim() : s.trim() || undefined);
    const payload: PetInput = {
      name: v.name.trim(),
      species,
      breed: text(v.breed),
      gender,
      dateOfBirth: v.dob.trim() || undefined,
      weight: v.weight.trim() ? Number(v.weight) : undefined,
      color: text(v.color),
      bloodGroup: text(v.bloodGroup),
      isNeutered: neutered,
      isVaccinated: vaccinated,
      allergies: text(v.allergies),
      notes: text(v.notes),
    };
    try {
      if (isEdit) await updatePet({ id: petId, changes: payload }).unwrap();
      else await addPet(payload).unwrap();
      router.back();
    } catch (e) {
      Alert.alert(errorMessage(e));
    }
  });

  const speciesOptions = Array.from(new Set<string>([...BASE_SPECIES, species]));

  return (
    <Screen edges={['left', 'right', 'bottom']} footer={<Button title={t('common.save')} icon="checkmark" onPress={submit} loading={adding || updating} />}>
      <TextField {...form.fieldProps('name')} label={`${t('pets.name')} *`} icon="paw-outline" maxLength={40} returnKeyType="next" onSubmitEditing={() => refs.breed.current?.focus()} />

      <View style={{ gap: 8 }}>
        <AppText variant="label" color="textSecondary">{t('pets.species')} *</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {speciesOptions.map((s) => (
            <Chip key={s} selected={s === species} onPress={() => setSpecies(s)} label={s === 'Dog' || s === 'Cat' || s === 'Other' ? t(`pets.speciesOptions.${s}`) : s} />
          ))}
        </View>
      </View>

      <TextField {...form.fieldProps('breed')} inputRef={refs.breed} label={t('pets.breed')} maxLength={60} returnKeyType="next" onSubmitEditing={() => refs.dob.current?.focus()} />

      <View style={{ gap: 8 }}>
        <AppText variant="label" color="textSecondary">{t('pets.gender')}</AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {GENDERS.map((g) => <Chip key={g} selected={g === gender} onPress={() => setGender(g)} label={t(`pets.genders.${g}`)} />)}
        </View>
      </View>

      <TextField
        {...form.fieldProps('dob', formatDateInput)}
        inputRef={refs.dob}
        label={t('pets.dateOfBirth')}
        icon="calendar-outline"
        placeholder="2021-06-15"
        keyboardType="number-pad"
        maxLength={10}
        returnKeyType="next"
        onSubmitEditing={() => refs.weight.current?.focus()}
      />
      <TextField {...form.fieldProps('weight')} inputRef={refs.weight} label={t('pets.weight')} icon="scale-outline" keyboardType="decimal-pad" maxLength={6} returnKeyType="next" onSubmitEditing={() => refs.color.current?.focus()} />
      <TextField {...form.fieldProps('color')} inputRef={refs.color} label={t('pets.color')} maxLength={30} returnKeyType="next" onSubmitEditing={() => refs.bloodGroup.current?.focus()} />
      <TextField {...form.fieldProps('bloodGroup')} inputRef={refs.bloodGroup} label={t('pets.bloodGroup')} maxLength={10} autoCapitalize="characters" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText>{t('pets.neutered')}</AppText>
        <Switch value={neutered} onValueChange={setNeutered} trackColor={{ true: colors.primary }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText>{t('pets.vaccinated')}</AppText>
        <Switch value={vaccinated} onValueChange={setVaccinated} trackColor={{ true: colors.primary }} />
      </View>

      <TextField {...form.fieldProps('allergies')} label={t('pets.allergies')} multiline maxLength={200} showCounter />
      <TextField {...form.fieldProps('notes')} label={t('pets.notes')} multiline maxLength={500} showCounter />
    </Screen>
  );
}
