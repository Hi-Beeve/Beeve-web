export interface HexUserProfile {
  id: string;
  name: string;
  profileImage: string;
  height: number;
  weight: number;
  age: number;
}

export interface HexData {
  근력: number;
  심폐지구력: number;
  유연성: number;
  순발력: number;
  민첩성: number;
  근지구력: number;
}

export interface HexGradeInfo {
  grade: string;
  description: string;
}

export interface HexWithDateResponse {
  user: HexUserProfile;
  hexData: HexData;
  gradeInfo: HexGradeInfo;
  date: string;
}

export interface HexWithDateRequest {
  date?: string;
  userId?: string;
}