export type AuthUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
};
