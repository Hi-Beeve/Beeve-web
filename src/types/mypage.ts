// 프로필 조회 GET /member/profile
export type ProfileResponse = {
    isSuccess: boolean;
    code: string;
    data: {
        name: string;
        birthDate: string;
        gender: string;
        height: number;
        weight: number;
        bmi: number;
        profileUrl: string;
        aiConsent: boolean;
    };
}

// AI 동의 상태 변경 PATCH /member/ai-consent
export type AiConsentRequest = {
  aiConsent: boolean;
}

export type AiConsentResponse = {
  isSuccess: boolean;
  code: string;
  data: { aiConsent: boolean };
}

export type ProfileResponseData = ProfileResponse['data'];

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