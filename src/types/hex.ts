export interface HexUserProfile {
  name: string;
  profileImage: string;
}

export type FITNESS_TYPE = "STRENGTH" | "CARDIO" | "ENDURANCE" | "FLEXIBILITY" | "AGILITY" | "QUICKNESS" ;
export type PROGRAM = "WALL_PUSH_UP" | "KNEE_PUSH_UP" | "STANDARD_PUSH_UP" | "VO2MAX" | "CROSS_CRUNCH" | "SIT_AND_REACH" | "REACTION_TIME" | "FLIGHT_TIME";
export interface HexData {
  fitnessType : FITNESS_TYPE;
  program : PROGRAM;
  value : number; // 측정값 (STRENGTH 인 경우 가중값을 의미)
  rawValue?: number; // STRENGTH에서만 존재하는 필드. 측정값을 의미
  grade: number; // 개별 등급
}

export interface HexGradeInfo {
  grade: string;
  description: string;
  rank: number;
}

export interface HexWithDateResponse {
 totalGrade : number; // 등급 
 totalRank : number; // 순위
 measurePlace : string; // 측정장소 GYM, HOME, OUTSIDE
 height : number; // 키
 weight : number; // 체중
 age : number; // 나이
 fitness : HexData[]; // 헥데이터

 date : string; // 측정일
}

export interface HexWithDateRequest {
  date?: string;
  userId?: string;
}

// - fitnessType 종류
// 1) 근력 - STRENGTH
// 2) 심폐지구력 - CARDIO 
// 3) 근지구력 - ENDURANCE 
// 4) 유연성 - FLEXIBILITY
// 5) 민첩성 - AGILITY
// 6) 순발력 - QUICKNESS

// - program종류
// 1.1) 벽 팔굽혀펴기 - WALL_PUSH_UP
// 1.2) 무릎 팔굽혀펴기 - KNEE_PUSH_UP
// 1.3) 표준 팔굽혀펴기 - STANDARD_PUSH_UP
// 2) 스텝검사_출력 - VO2MAX
// 3) 교차윗몸일으키기 - CROSS_CRUNCH
// 4) 앉아윗몸앞으로굽히기 - SIT_AND_REACH
// 5) 반응시간 - REACTION_TIME
// 6) 체공시간 - FLIGHT_TIME
