import programStandard, { AgeGroup, FitnessStandard } from "@/config/program-standard";

// 나이를 연령대로 변환하는 함수
export const getAgeGroup = (age: number): AgeGroup => {
    if (age >= 19 && age <= 24) return "19~24";
    if (age >= 25 && age <= 29) return "25~29";
    if (age >= 30 && age <= 34) return "30~34";
    if (age >= 35 && age <= 39) return "35~39";
    if (age >= 40 && age <= 44) return "40~44";
    if (age >= 45 && age <= 49) return "45~49";
    if (age >= 50 && age <= 54) return "50~54";
    if (age >= 55 && age <= 59) return "55~59";
    if (age >= 60 && age <= 64) return "60~64";
    throw new Error("지원하지 않는 연령대입니다.");
};

// 체력 표준 조회 함수
export const getFitnessStandard = (
    grade: 1 | 2 | 3,
    gender: 'male' | 'female',
    ageGroup: AgeGroup
): FitnessStandard | undefined => {
    return programStandard[grade]?.[gender]?.[ageGroup];
};

// 나이로 체력 표준 조회 함수
export const getFitnessStandardByAge = (
    grade: 1 | 2 | 3,
    gender: 'male' | 'female',
    age: number
): FitnessStandard | undefined => {
    const ageGroup = getAgeGroup(age);
    return getFitnessStandard(grade, gender, ageGroup);
};

// 특정 체력 요소만 조회하는 함수
export const getFitnessValue = (
    grade: 1 | 2 | 3,
    gender: 'male' | 'female',
    age: number,
    fitnessType: keyof FitnessStandard
): number | string | undefined => {
    const standard = getFitnessStandardByAge(grade, gender, age);
    return standard?.[fitnessType];
};