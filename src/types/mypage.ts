// 프로필 조회 GET /member/profile
export type ProfileResponse = {
    name: string;
    birthDate: string;
    gender: string;
    height: number;
    weight: number;
    bmi: number;
    profileUrl: string;
}

// 프로필 수정 POST /member/profile
export type ProfileUpdateRequest = {
  name: string;
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  profileUrl?: string;
}

export type ProfileUpdateResponse = {
  isSuccess: boolean;
  code: string;
  data: {
    name: string;
    profileUrl: string;
  };
}