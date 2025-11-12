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
  step: {
    title: '스텝검사',
    youtubeVideoId: '5ax1Eh8U3rg', 
    instructions: [
      '의자에 앉아 심박수가 안정 될 때까지 휴식을 취하고 심박수를 측정한다. (심박수 100bpm 미만 권장)',
      "'시작' 신호와 함께 메트로놈 박자(96bpm)에 맞춰 3분 동안 스텝박스 걷는다.",
      '3분을 걷고 난 뒤, 의자에 앉아서 1분간 휴식을 취합니다. 정확히 1분이 되었을 때의 심박수를 측정한다.',
    ],
    precautions: [
      { text: '박스 위에 뒷꿈치까지 다 올라가야 하며 무릎은 완전히 펴져야한다.' },
      { text: '박자에 맞춰 연습하고 측정을 실시한다.' },
      { text: '측정 중 박자를 놓치지 않는 범위 내에서 올라가는 발의 순서를 바꿀 수 있다.' },
    ],
  },
  'sit-and-reach': {
    title: '윗몸앉아앞으로굽히기',
    youtubeVideoId: 'Fov7k8n9ddU', 
    instructions: [
      '양 발의 사이가 5cm이내로 벌려 발판에 붙여주시고, 무릎을 펴서 바르게 앉는다.',
      '양 손을 곧게 펴서 손 끝이 측정기에 닿도록 하여 윗몸을 앞으로 굽히면서 밀어주시고 3초 이상 유지한다.',
      '2회 측정하고, 가장 좋은 기록을 0.1cm 단위로 기록한다.',
    ],
    precautions: [
      { text: '측정 시 양손 끝이 모두 측정 기구에 닿아 있어야 하며 무릎을 굽히지 않는다.' },
      { text: '갑작스러운 반동을 이용하여 측정하지 않는다.' },
      { text: '손에서 손 끝 외에 다른 부위에 측정기에 닿지 않는다' },
      { text: '무릎이 구부러지지 않도록 한다' },
    ],
  },
  'standing-jump': {
    title: '제자리 높이뛰기',
    youtubeVideoId: 'QSYuh5GP8pA', 
    instructions: [
      '양 발을 어깨너비만큼 다리를 벌리고 편하게 선다.',
      '서서 팔이나 몸, 다리로 충분하게 반동을 주면서 신호에 맞춰 최대한 높이 뛴다.',
      '뛰어오른 후 착지하는 순간까지의 시간을 측정한다. 착지 시 양발이 모두 바닥에 있어야 기록으로 인정된다.',
    ],
    precautions: [
      { text: '점프 후 무릎을 굽혀도 되지만, 부상에 유의해야한다.' },
      { text: '이중도약이나 발이 움직인 후에 뛰면 안된다.' },
      { text: '두발을 동시에 점프한다.' },
    ],
  },
  'reaction-time': {
    title: '반응 시간 검사',
    youtubeVideoId: '9lrZBXpO76c', 
    instructions: [
      '양 발을 어깨 너비만큼 다리를 벌리고 편하게 선다.',
      '예고 없이 들리는 신호에 반응하여 양 발을 동시에 벌린다.\n3회 측정하고, 가장 좋은 기록을 0.001초 단위로 반영한다.',
    ],
    precautions: [
      { text: '신호를 예측하여 움직이지 않도록 한다.' },
      { text: '양 발을 모두 바닥에서 떨어지도록 한다.' },
    ],
  },
};
