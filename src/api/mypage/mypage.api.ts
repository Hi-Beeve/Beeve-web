import instance from '@/api/instance';
import { ProfileResponse, ProfileUpdateRequest, ProfileUpdateResponse, AiConsentRequest, AiConsentResponse } from '@/types/mypage';


// 프로필 조회 API
export const getProfileApi = async (): Promise<ProfileResponse> => {
  const response = await instance.get<ProfileResponse>('/member/profile');
  return response.data;
};

// 프로필 수정 API
export const updateProfileApi = async (params: ProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
  const response = await instance.post<ProfileUpdateResponse>('/member/profile', {params:{
    ...params,
    gender : params.gender === 'male'?'M':'F'
  }});
  return response.data;
};

// AI 동의 상태 변경 API
export const updateAiConsentApi = async (params: AiConsentRequest): Promise<AiConsentResponse> => {
  const response = await instance.patch<AiConsentResponse>('/member/ai-consent', params);
  return response.data;
};
