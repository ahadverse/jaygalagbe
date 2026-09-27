import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import { loginSchema, type LoginFormValues } from '../../features/auth/schema';
import type { ProfileStackScreenProps } from '../../navigation/types';

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
      <Text variant="headlineSmall" style={styles.title}>
        Welcome back
      </Text>

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
      >
        Log in
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Register')}
        style={styles.linkButton}
      >
        Don&apos;t have an account? Create one
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 8,
  },
});
