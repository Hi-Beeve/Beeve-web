import { useProfileQuery, useUpdateProfileQuery } from "./queries";

export const useMember = () => {
  const query = useProfileQuery();

  // 개발용 mock 데이터
  const mockData = {
    name: "김개발",
    birthDate: "1995-03-15",
    gender: "male",
    height: 175.5,
    weight: 68.2,
    bmi: 22.1,
    profileUrl: "https://localhost:3001/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  };

  return {
    ...query,
    data: mockData, // 임시로 mock 데이터 사용
    // data: query.data, // 실제 API 연동 시 이 라인 사용
  };
};

export const useUpdateProfile = () => {
  const mutation = useUpdateProfileQuery();

  return {
    ...mutation,
    updateProfile: mutation.mutate,
  };
};