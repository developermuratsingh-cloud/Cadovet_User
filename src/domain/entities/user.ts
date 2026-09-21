export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export type Permission = string;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
