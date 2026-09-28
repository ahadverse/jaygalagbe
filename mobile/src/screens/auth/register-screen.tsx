import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Wordmark } from '../../components/brand/wordmark';
import { useAuth } from '../../features/auth/auth-context';
import {
  registerSchema,
  type RegisterFormValues,
} from '../../features/auth/schema';
import type { ProfileStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

export function RegisterScreen({
  navigation,
}: ProfileStackScreenProps<'Register'>) {
  const { register } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register(values);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the server. Please try again.",
      );
    }
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Wordmark size="lg" />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Post listings, save favourites and message owners directly.
        </Text>
      </View>

      <BrandCard variant="card" radius="lg">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextInput
              label="Full name"
              mode="outlined"
              autoComplete="name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={!!errors.name}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name?.message}
        </HelperText>

        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <TextInput
              label="Email or phone"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={!!errors.identifier}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.identifier}>
          {errors.identifier?.message}
        </HelperText>

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              autoComplete="new-password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={!!errors.password}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password?.message}
        </HelperText>

        <HelperText type="error" visible={!!formError}>
          {formError}
        </HelperText>

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
        >
          Create account
        </Button>
      </BrandCard>

      <Pressable
        onPress={() => navigation.navigate('Login')}
        style={styles.switchLink}
        accessibilityRole="button"
      >
        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text style={styles.switchAction}>Log in</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    letterSpacing: -0.6,
    textAlign: 'center',
    color: colors.neutral[900],
    marginTop: 12,
  },
  subtitle: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.neutral[600],
  },
  submitButton: {
    borderRadius: radius.full,
    marginTop: 4,
  },
  submitContent: {
    paddingVertical: 5,
  },
  switchLink: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 6,
  },
  switchText: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    color: colors.neutral[600],
  },
  switchAction: {
    fontFamily: fontFamily.textSemibold,
    color: colors.brand[700],
  },
});
