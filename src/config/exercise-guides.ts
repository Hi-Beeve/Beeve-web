export interface ExerciseGuide {
  title: string;
  youtubeVideoId: string;
  instructions: string[];
  precautions: Precaution[];
}

export type Precaution = {
  text: string;
  indented?: boolean;
};

export const EXERCISE_GUIDES: { [key: string]: ExerciseGuide } = {
  situp: {
    title: '윗몸일으키기',
    youtubeVideoId: 'CY4ayUED7sI', // 예시: 국방부 싯업 영상
    instructions: [
      '양발을 고정하고 등과 어깨를 대고 눕는다.',
      '양팔은 십자모양으로 교차하여 가슴 앞에 모으고, 두 손은 어깨 위로 올린다.',
      '‘시작’ 신호에 따라 상체를 일으켜 양 팔꿈치가 허벅지게 닿도록 하고 다음으로 등과 양쪽 어깨를 바닥에 닿도록 눕는다.',
      '양쪽 팔꿈치가 허벅지에 닿았을 때 1회로 인정하며 1분동안 실시하여 성공한 횟수를 기록한다.',
    ],
    precautions: [
      { text: '아래와 같은 동작은 인정되지 않습니다!' },
      { text: '팔꿈치를 위 아래로 과도하게 움직여 상체를 일으키는 경우', indented: true },
      { text: '엉덩이를 들었다 내리는 반동으로 상체를 일으키는 경우', indented: true },
      { text: '손바닥이 어깨에서 떨어진 경우', indented: true },
      { text: '양쪽 어깨가 바닥에 닿지 않은 경우', indented: true },
      { text: '옷이나 어깨가 아닌 다른 신체를 잡고 일어나는 경우', indented: true },
    ],
  },
  'pushup-wall': {
    title: '벽 대고 팔굽혀펴기',
    youtubeVideoId: 'E_34zLuYpoE', // 예시: 벽 푸시업 영상
    instructions: [
      '벽을 마주보고 서서 어깨너비보다 넓게 손을 짚습니다.',
      '발은 어깨너비만큼 벌리고, 몸은 머리부터 발끝까지 일직선을 유지합니다.',
      '3. 팔꿈치를 구부려 가슴이 벽에 가까워질 때까지 천천히 다가갑니다.',
      '시작 자세로 돌아올 때는 팔을 완전히 펴줍니다.',
    ],
    precautions: [
      { text: '아래와 같은 동작은 정확한 자세가 아닙니다!' },
      { text: '허리가 구부러지거나 엉덩이가 뒤로 빠지는 경우', indented: true },
      { text: '팔꿈치만 구부리고 상체는 움직이지 않는 경우', indented: true },
      { text: '어깨에 과도한 힘이 들어가는 경우', indented: true },
    ],
  },
  'pushup-knee': {
    title: '무릎 대고 팔굽혀펴기',
    youtubeVideoId: 't-dY2tV3I-E', // 예시: 니 푸시업 영상
    instructions: [
      '무릎을 바닥에 대고 어깨너비보다 넓게 손을 짚습니다.',
      '머리부터 무릎까지 몸이 일직선이 되도록 자세를 잡습니다.',
      '가슴이 바닥에 닿기 직전까지 몸을 내렸다가, 팔을 완전히 펴서 시작 자세로 돌아옵니다.',
      '1분동안 최대한 많이 반복합니다.',
    ],
    precautions: [
      { text: '아래와 같은 동작은 정확한 자세가 아닙니다!' },
      { text: '엉덩이만 위아래로 움직이는 경우', indented: true },
      { text: '허리가 아래로 푹 꺼지는 경우', indented: true },
      { text: '팔을 완전히 펴거나, 충분히 내려가지 않는 경우', indented: true },
    ],
  },
  'pushup-standard': {
    title: '정자세 팔굽혀펴기',
    youtubeVideoId: 'C2d44M-3s-Y', // 예시: 정자세 푸시업 영상
    instructions: [
      '양손을 어깨너비보다 약간 넓게 벌려 바닥에 위치시키고, 발끝으로 지지하여 엎드립니다.',
      '머리부터 발끝까지 몸이 일직선이 되도록 유지합니다.',
      '팔꿈치를 구부려 가슴이 바닥에 닿기 직전(주먹 하나 높이)까지 몸을 내립니다.',
      '팔을 완전히 펴서 시작 자세로 돌아오면 1회로 인정되며, 1분동안 실시합니다.',
    ],
    precautions: [
      { text: '아래와 같은 동작은 인정되지 않습니다!' },
      { text: '허리가 휘거나 엉덩이가 위로 올라간 경우', indented: true },
      { text: '팔꿈치를 완전히 펴지 않은 경우', indented: true },
      { text: '몸이 바닥까지 충분히 내려가지 않은 경우', indented: true },
      { text: '무릎이 바닥에 닿는 경우', indented: true },
    ],
  },
};
