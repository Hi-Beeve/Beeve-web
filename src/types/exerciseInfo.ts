export enum ExerciseGoal {
  FITNESS_IMPROVEMENT = '체력증진',
  MUSCLE_GAIN = '근육량 증가',
  STRENGTH = '근력 강화',
  FAT_LOSS = '지방감소',
  FLEXIBILITY = '유연성 향상',
  COMPETITION = '대회준비',
  RECOVERY = '건강회복',
  STRESS_RELIEF = '스트레스해소',
  HABIT_BUILDING = '운동습관 형성',
}

export enum ExercisePlace {
  HOME = '집',
  OUTDOOR = '야외',
  GYM = '헬스장',
}

export enum Equipment {
  STAIRS = '계단',
  DUMBBELL = '덤벨',
  DIP_BAR = '딥스바',
  MEDICINE_BALL = '메디신 볼',
  BARBELL = '바벨',
  BOX_OR_CHAIR = '박스 혹은 의자',
  BATTLE_ROPE = '배틀로프',
  VERTICAL_CLIMBER = '버티컬 클라이머 머신',
  WALL = '벽',
  SOFA = '소파',
  STEP_LADDER = '스텝레더',
  STEP_BOX = '스텝박스',
  NONE = '없음',
  AIR_BIKE = '에어바이크',
  CHAIR_SOFA = '의자/소파',
  BICYCLE = '자전거',
  JUMP_ROPE = '줄넘기',
  GYM_BALL = '짐볼',
  PULL_UP_BAR = '철봉',
  KETTLEBELL = '케틀벨',
  CONE = '콘',
  RESISTANCE_BAND = '탄력밴드',
  TREADMILL = '트레드밀',
}

export enum HealthIssueType {
  DISEASE = 'disease',
  INJURY = 'injury',
}

export interface ExerciseInfoRequest {
  goal: ExerciseGoal;
  place: ExercisePlace;
  equipment: Equipment[];
  healthIssueType?: HealthIssueType;
  healthIssueText?: string;
}

export interface ExerciseInfoData {
  exerciseInfoId: number;
  goal: string;
  place: string;
  equipment: string[];
  disease: string | null;
  injury: string | null;
}

export interface ExerciseInfoGetResponse {
  isSuccess: boolean;
  data: ExerciseInfoData;
}

export interface ExerciseInfoPostResponse {
  code: string;
  message: string;
  data: unknown;
}
