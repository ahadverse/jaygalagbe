import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Wordmark } from '../../components/brand/wordmark';
import { useAuth } from '../../features/auth/auth-context';
import { loginSchema, type LoginFormValues } from '../../features/auth/schema';
import type { ProfileStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

export function LoginScreen({ navigation }: ProfileStackScreenProps<'Login'>) {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to pick up your listings and conversations.
        </Text>
      </View>

      <BrandCard variant="card" radius="lg">
        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <TextInput
              label="Email or phone"
              mode="outlined"
              autoCapitalize="none"
              autoComplete="username"
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
              autoComplete="current-password"
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
          Log in
        </Button>
      </BrandCard>

      <Pressable
        onPress={() => navigation.navigate('Register')}
        style={styles.switchLink}
        accessibilityRole="button"
      >
        <Text style={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Text style={styles.switchAction}>Create one</Text>
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
