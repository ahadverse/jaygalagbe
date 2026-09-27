// Mirrors backend's AuthenticatedUser (Omit<User, 'passwordHash'>), returned
// by /auth/login, /auth/register and /users/me.
export type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
