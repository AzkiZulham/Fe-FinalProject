export interface TenantData {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  profileImg: string;
  verified: boolean;
  isEmailUpdated: boolean;
  isEmailVerified?: boolean;
}
