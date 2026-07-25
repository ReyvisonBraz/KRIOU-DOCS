export interface UserProfile {
  id: string;
  email: string | null;
  display_name?: string | null;
  full_name?: string | null;
  cpf?: string | null;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: UserProfile | null;
  userId: string | null;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  isAuthLoading: boolean;
}
