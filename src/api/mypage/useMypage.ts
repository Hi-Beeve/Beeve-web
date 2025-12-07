import { useEffect } from "react";
import { useProfileQuery, useUpdateProfileQuery } from "./queries";
import { useAuth } from "@/contexts/auth-context";

export const useMember = () => {
  const query = useProfileQuery();
  const { updateProfile } = useAuth();

  // 프로필 데이터가 로드되면 AuthContext에 저장
  useEffect(() => {
    if (query.data && query.isSuccess) {
      updateProfile({
        birthDate: query.data.birthDate,
        height: query.data.height,
        weight: query.data.weight,
        gender: query.data.gender,
        nickname: query.data.name,
        profileImage: query.data.profileUrl
      });
      console.log('✅ Profile data saved to AuthContext:', query.data);
    }
  }, [query.data, query.isSuccess, updateProfile]);

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