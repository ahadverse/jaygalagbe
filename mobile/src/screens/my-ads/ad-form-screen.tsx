import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

import { PhotoPicker } from '../../components/ads/photo-picker';
import { SelectField } from '../../components/forms/select-field';
import { ApiError } from '../../api/errors';
import {
  createAd,
  getAd,
  updateAd,
  type AdInput,
} from '../../features/ads/api';
import {
  getSectorOptionBySector,
  sectors,
  type Sector,
} from '../../features/ads/sectors';
import type {
  Ad,
  HouseRentAttributes,
  LandAttributes,
} from '../../features/ads/types';
import {
  DIVISION_NAMES,
  districtsOf,
  isValidBdLocation,
  thanasOf,
} from '../../data/bd-geo';
import type { MyAdsStackScreenProps } from '../../navigation/types';

// Fetches the ad (edit only) and gates on it loading, then mounts the form
// body fresh - AdFormBody's fields are seeded via lazy useState initializers
// reading straight from `existingAd`, so there's no "prefill" effect: it's
// simply not rendered until the data it needs is already in hand.
export function AdFormScreen({
  route,
  navigation,
}: MyAdsStackScreenProps<'AdForm'>) {
  const adId = route.params?.adId;
  const isEdit = !!adId;

  const { data: existingAd, isPending: loadingAd } = useQuery({
    queryKey: ['ads', 'detail', adId],
    queryFn: () => getAd(adId!),
    enabled: isEdit,
  });

  if (isEdit && loadingAd) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <AdFormBody adId={adId} existingAd={existingAd} navigation={navigation} />
  );
}

function AdFormBody({
  adId,
  existingAd,
  navigation,
}: {
  adId: string | undefined;
  existingAd: Ad | undefined;
  navigation: MyAdsStackScreenProps<'AdForm'>['navigation'];
}) {
  const isEdit = !!adId;
  const queryClient = useQueryClient();

  const [sector, setSector] = useState<Sector>(existingAd?.sector ?? 'LAND');
  const [title, setTitle] = useState(existingAd?.title ?? '');
  const [description, setDescription] = useState(existingAd?.description ?? '');
  const [price, setPrice] = useState(
    existingAd ? String(existingAd.price) : '',
  );
  const [division, setDivision] = useState(existingAd?.locationDivision ?? '');
  const [district, setDistrict] = useState(existingAd?.locationDistrict ?? '');
  const [thana, setThana] = useState(existingAd?.locationArea ?? '');
  const [address, setAddress] = useState(existingAd?.address ?? '');
  const [photos, setPhotos] = useState<string[]>(existingAd?.photos ?? []);

  const landAttrs =
    existingAd?.sector === 'LAND'
      ? (existingAd.attributes as LandAttributes | null)
      : null;
  const houseAttrs =
    existingAd?.sector === 'HOUSE_RENT'
      ? (existingAd.attributes as HouseRentAttributes | null)
      : null;

  const [sizeKatha, setSizeKatha] = useState(
    landAttrs?.sizeKatha != null ? String(landAttrs.sizeKatha) : '',
  );
  const [bedrooms, setBedrooms] = useState(
    houseAttrs?.bedrooms != null ? String(houseAttrs.bedrooms) : '',
  );
  const [bathrooms, setBathrooms] = useState(
    houseAttrs?.bathrooms != null ? String(houseAttrs.bathrooms) : '',
  );
  const [propertyType, setPropertyType] = useState(
    landAttrs?.propertyType ?? houseAttrs?.propertyType ?? '',
  );
  const [furnished, setFurnished] = useState(!!houseAttrs?.furnished);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sectorOption = getSectorOptionBySector(sector);
  const districts = districtsOf(division).map((d) => d.name);
  const thanas = thanasOf(division, district);

  function onDivisionChange(next: string) {
    setDivision(next);
    setDistrict('');
    setThana('');
  }

  function onDistrictChange(next: string) {
    setDistrict(next);
    setThana('');
  }

  async function submit() {
    setError(null);
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5 || trimmedTitle.length > 150) {
      setError('Title must be 5-150 characters.');
      return;
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 20 || trimmedDescription.length > 5000) {
      setError('Description must be at least 20 characters.');
      return;
    }
    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError('Enter a valid price.');
      return;
    }
    if (!isValidBdLocation(division, district, thana)) {
      setError('Pick a real division, district and thana combination.');
      return;
    }

    let attributes: Record<string, unknown>;
    if (sector === 'LAND') {
      const size = Number(sizeKatha);
      if (!Number.isFinite(size) || size < 0) {
        setError('Enter a valid size in katha.');
        return;
      }
      attributes = {
        sizeKatha: size,
        ...(propertyType ? { propertyType } : {}),
      };
    } else {
      const beds = Number(bedrooms);
      if (!Number.isInteger(beds) || beds < 0) {
        setError('Enter a valid number of bedrooms.');
        return;
      }
      attributes = {
        bedrooms: beds,
        ...(bathrooms ? { bathrooms: Number(bathrooms) } : {}),
        ...(propertyType ? { propertyType } : {}),
        furnished,
      };
    }

    const input: AdInput = {
      sector,
      title: trimmedTitle,
      description: trimmedDescription,
      price: priceNumber,
      locationDivision: division,
      locationDistrict: district,
      locationArea: thana,
      address: address.trim() || undefined,
      photos,
      attributes,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateAd(adId!, input);
      } else {
        await createAd(input);
      }
      await queryClient.invalidateQueries({ queryKey: ['ads', 'mine'] });
      navigation.goBack();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't save this listing. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isEdit ? (
        <SegmentedButtons
          value={sector}
          onValueChange={(value) => setSector(value as Sector)}
          buttons={sectors.map((option) => ({
            value: option.sector,
            label: option.label,
          }))}
        />
      ) : (
        <Text variant="titleMedium">{sectorOption.label}</Text>
      )}

      <TextInput
        mode="outlined"
        label="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        mode="outlined"
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TextInput
        mode="outlined"
        label={sector === 'LAND' ? 'Asking price' : 'Monthly rent'}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        left={<TextInput.Affix text={'৳'} />}
      />

      <SelectField
        label="Division"
        value={division}
        options={DIVISION_NAMES}
        onChange={onDivisionChange}
      />
      <SelectField
        label="District"
        value={district}
        options={districts}
        onChange={onDistrictChange}
        disabled={districts.length === 0}
        placeholder={division ? 'Select district' : 'Pick a division first'}
      />
      <SelectField
        label="Thana"
        value={thana}
        options={thanas}
        onChange={setThana}
        disabled={thanas.length === 0}
        placeholder={district ? 'Select thana' : 'Pick a district first'}
      />
      <TextInput
        mode="outlined"
        label="Address (optional)"
        value={address}
        onChangeText={setAddress}
      />

      <PhotoPicker photos={photos} onChange={setPhotos} />

      {sector === 'LAND' ? (
        <>
          <TextInput
            mode="outlined"
            label="Size (katha)"
            value={sizeKatha}
            onChangeText={setSizeKatha}
            keyboardType="numeric"
          />
          <SelectField
            label="Property type (optional)"
            value={propertyType}
            options={sectorOption.propertyTypes}
            onChange={setPropertyType}
          />
        </>
      ) : (
        <>
          <TextInput
            mode="outlined"
            label="Bedrooms"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            label="Bathrooms (optional)"
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="numeric"
          />
          <SelectField
            label="Property type (optional)"
            value={propertyType}
            options={sectorOption.propertyTypes}
            onChange={setPropertyType}
          />
          <View style={styles.checkboxRow}>
            <Checkbox
              status={furnished ? 'checked' : 'unchecked'}
              onPress={() => setFurnished((value) => !value)}
            />
            <Text onPress={() => setFurnished((value) => !value)}>
              Furnished
            </Text>
          </View>
        </>
      )}

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={submit}
        loading={submitting}
        disabled={submitting}
      >
        {isEdit ? 'Save changes' : 'Post ad'}
      </Button>
      <Text variant="bodySmall">
        {isEdit
          ? 'Edited ads are re-checked before they return to the listings.'
          : 'Your ad goes to review first - usually approved within a day.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
