import { useEffect } from "react";
import { useProfileQuery, useUpdateProfileQuery } from "./queries";
import { useAuth } from "@/contexts/auth-context";

export const useMember = () => {
  const query = useProfileQuery();
  const { updateProfile, user } = useAuth();

  // 프로필 데이터가 로드되면 AuthContext에 저장 (중복 업데이트 방지)
  useEffect(() => {
    if (query.data && query.isSuccess) {
      // 현재 사용자 정보와 비교하여 변경된 경우에만 업데이트
      const newProfileData = {
        birthDate: query.data.birthDate,
        height: query.data.height,
        weight: query.data.weight,
        gender: query.data.gender,
        nickname: query.data.name,
        profileImage: query.data.profileUrl
      };

      // 기존 데이터와 비교
      const hasChanged = !user || 
        user.birthDate !== newProfileData.birthDate ||
        user.height !== newProfileData.height ||
        user.weight !== newProfileData.weight ||
        user.gender !== newProfileData.gender ||
        user.nickname !== newProfileData.nickname ||
        user.profileImage !== newProfileData.profileImage;

      if (hasChanged) {
        updateProfile(newProfileData);
        console.log('✅ Profile data updated in AuthContext:', query.data);
      }
    }
  }, [query.data, query.isSuccess]); // updateProfile 의존성 제거

  return {
    ...query,
    data: query.data,
  }
};

export const useUpdateProfile = () => {
  const mutation = useUpdateProfileQuery();

  return {
    ...mutation,
    updateProfile: mutation.mutate,
  };
};