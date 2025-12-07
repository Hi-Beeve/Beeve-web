/**
 * 나이를 기반으로 연령대 범위를 계산합니다.
 * 20세부터 5세 단위로 나누어 64세까지 처리합니다.
 * @param age 사용자의 나이
 * @returns 연령대 범위 문자열 (예: "20~24", "25~29")
 */
export const getAgeRange = (age: number): string => {
  // 20세 미만인 경우
  if (age < 20) {
    return "20세 미만";
  }
  
  // 65세 이상인 경우
  if (age >= 65) {
    return "65세 이상";
  }
  
  // 20세부터 64세까지 5세 단위로 계산
  const rangeStart = Math.floor((age - 20) / 5) * 5 + 20;
  const rangeEnd = rangeStart + 4;
  
  return `${rangeStart}~${rangeEnd}`;
};

/**
 * 생년월일을 기반으로 현재 나이를 계산합니다.
 * @param birthDate 생년월일 문자열 (YYYY-MM-DD 형식)
 * @returns 현재 나이
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // 생일이 지나지 않았으면 나이에서 1을 뺍니다
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
