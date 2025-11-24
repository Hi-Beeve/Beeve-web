import instance from '@/api/instance';
import { ProfileResponse, ProfileUpdateRequest, ProfileUpdateResponse } from '@/types/mypage';


// 프로필 조회 API
export const getProfileApi = async (): Promise<ProfileResponse> => {
  const response = await instance.get<ProfileResponse>('/member/profile');
  return response.data;
};

// 프로필 수정 API
export const updateProfileApi = async (params: ProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
  const response = await instance.post<ProfileUpdateResponse>('/member/profile', params);
  return response.data;
};
