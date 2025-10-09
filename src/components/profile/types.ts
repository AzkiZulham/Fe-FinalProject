export interface UserData {
  userName: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  verified: boolean;
  isEmailUpdated: boolean;
  isEmailVerified?: boolean; 
}

