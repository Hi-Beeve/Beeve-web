# Beeve Web - Vercel 배포 가이드

## 🚀 배포 프로세스

### 1. 사전 준비

#### Vercel CLI 설치
```bash
npm i -g vercel
```

#### Vercel 로그인
```bash
vercel login
```

### 2. 첫 배포 (프로젝트 연결)

#### 프로젝트 루트에서 실행
```bash
vercel
```

이 명령어를 실행하면:
- 프로젝트를 Vercel에 연결
- 자동으로 빌드 및 배포
- 미리보기 URL 생성

### 3. 프로덕션 배포

#### 방법 1: CLI 사용
```bash
npm run deploy
# 또는
vercel --prod
```

#### 방법 2: Git 연동 (권장)
1. GitHub에 코드 푸시
2. Vercel 대시보드에서 자동 배포 확인

### 4. 미리보기 배포

```bash
npm run deploy:preview
# 또는
vercel
```

## ⚙️ 설정 파일 설명

### `vercel.json`
- **buildCommand**: 빌드 명령어
- **outputDirectory**: 빌드 결과물 디렉토리
- **framework**: Next.js 프레임워크 자동 감지
- **regions**: 서울 리전 (icn1) 설정
- **headers**: 보안 헤더 설정
- **rewrites**: 라우팅 규칙

### `next.config.ts`
- **output**: standalone 모드로 최적화
- **images**: 이미지 최적화 설정
- **webpack**: MediaPipe 호환성 설정
- **headers**: 추가 보안 헤더

## 🔧 환경 변수 설정

### Vercel 대시보드에서 설정
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 필요한 환경 변수 추가

### 로컬 개발용
```bash
cp env.example .env.local
# .env.local 파일 편집
```

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 로컬에서 빌드 테스트: `npm run build`
- [ ] 타입 체크: `npm run type-check`
- [ ] 린트 검사: `npm run lint`
- [ ] 환경 변수 설정 확인

### 배포 후 확인사항
- [ ] 모든 페이지 정상 작동 확인
- [ ] MediaPipe 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] 성능 최적화 확인

## 🛠️ 유용한 명령어

```bash
# 로컬 빌드 테스트
npm run build

# 로컬에서 프로덕션 모드 실행
npm run preview

# 타입 체크
npm run type-check

# Vercel 프로젝트 정보 확인
vercel ls

# 배포 로그 확인
vercel logs [deployment-url]

# 도메인 설정
vercel domains add [domain-name]
```

## 🔍 트러블슈팅

### 빌드 실패 시
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. 의존성 버전 충돌 확인
3. TypeScript 오류 해결

### MediaPipe 관련 오류
- `next.config.ts`의 webpack 설정 확인
- 브라우저 호환성 확인

### 성능 최적화
- Vercel Analytics 활용
- Core Web Vitals 모니터링
- 이미지 최적화 확인

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
