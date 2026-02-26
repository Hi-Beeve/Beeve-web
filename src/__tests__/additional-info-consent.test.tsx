import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdditionalInfoPage from '@/app/auth/additional-info/page';

// ── 외부 의존성 Mock ──────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    target,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
  }) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

vi.mock('@/api/auth/useAuth', () => ({
  useSignUp: () => ({
    signUp: vi.fn(),
    isLoading: false,
    error: null,
    data: null,
    isSuccess: false,
  }),
}));

// FormComponents: 외부 UI 라이브러리 의존성을 제거하고 핵심 로직만 테스트
vi.mock('@/components/common/FormComponents', () => ({
  GenderSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (g: string) => void;
  }) => (
    <div data-testid="gender-select">
      <button
        type="button"
        data-testid="gender-male"
        aria-pressed={value === 'male'}
        onClick={() => onChange('male')}
      >
        남성
      </button>
      <button
        type="button"
        data-testid="gender-female"
        aria-pressed={value === 'female'}
        onClick={() => onChange('female')}
      >
        여성
      </button>
    </div>
  ),
  BirthDateSelect: () => <div data-testid="birthdate-select" />,
  PhysicalInfoInput: () => <div data-testid="physical-info-input" />,
  PhoneVerificationInput: () => <div data-testid="phone-verification-input" />,
}));

vi.mock('@/components/progress_bar', () => ({
  ProgressBar: ({ stepInfo }: { stepInfo: { step: number; total: number } }) => (
    <div data-testid="progress-bar">
      {stepInfo.step}/{stepInfo.total}
    </div>
  ),
}));

// ── 테스트용 OAuth 유저 픽스처 ─────────────────────────────

const mockOAuthUser = {
  id: 'user-001',
  nickname: '테스트유저',
  email: 'test@example.com',
  profileImage: '',
  provider: 'google',
};

// ── 헬퍼 ──────────────────────────────────────────────────

/** sessionStorage에 pendingUserInfo를 설정하고 페이지를 렌더링 */
async function renderWithMockUser() {
  sessionStorage.setItem('pendingUserInfo', JSON.stringify(mockOAuthUser));
  render(<AdditionalInfoPage />);
  // useEffect가 sessionStorage를 읽고 tempUser를 설정할 때까지 대기
  await waitFor(() => {
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });
}

// ── 테스트 ────────────────────────────────────────────────

describe('회원가입 1단계 – 개인정보 동의 체크박스', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockPush.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('렌더링', () => {
    it('pendingUserInfo가 없으면 로그인 페이지(/)로 리다이렉트된다', async () => {
      render(<AdditionalInfoPage />);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('pendingUserInfo가 있으면 1단계(성별 선택) 화면이 표시된다', async () => {
      await renderWithMockUser();
      expect(screen.getByTestId('gender-select')).toBeInTheDocument();
    });

    it('닉네임이 헤더에 표시된다', async () => {
      await renderWithMockUser();
      expect(screen.getByText(`${mockOAuthUser.nickname}님의 맞춤형 운동 분석을 위해 필요해요`)).toBeInTheDocument();
    });

    it('프로그레스 바가 1/4로 표시된다', async () => {
      await renderWithMockUser();
      expect(screen.getByTestId('progress-bar')).toHaveTextContent('1/4');
    });
  });

  describe('동의 체크박스 UI', () => {
    it('개인정보 동의 체크박스가 렌더링된다', async () => {
      await renderWithMockUser();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('초기 상태에서 체크박스는 체크 해제 상태이다', async () => {
      await renderWithMockUser();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('체크박스를 클릭하면 체크 상태가 된다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('체크 후 다시 클릭하면 체크 해제 상태가 된다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('"개인정보 수집·이용" 텍스트가 /privacy 링크로 연결된다', async () => {
      await renderWithMockUser();
      const link = screen.getByRole('link', { name: '개인정보 수집·이용' });
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('/privacy 링크는 새 탭(target="_blank")으로 열린다', async () => {
      await renderWithMockUser();
      const link = screen.getByRole('link', { name: '개인정보 수집·이용' });
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('다음 버튼 동작 – 미동의 케이스', () => {
    it('동의 없이 다음 클릭 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();
      await user.click(screen.getByRole('button', { name: '다음' }));
      expect(
        screen.getByText('개인정보 수집·이용에 동의해주세요.')
      ).toBeInTheDocument();
    });

    it('미동의 에러 시 화면이 1단계(gender)에 머문다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();
      await user.click(screen.getByRole('button', { name: '다음' }));
      expect(screen.getByTestId('gender-select')).toBeInTheDocument();
    });
  });

  describe('다음 버튼 동작 – 동의 + 성별 미선택 케이스', () => {
    it('동의했지만 성별 미선택 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: '다음' }));
      expect(screen.getByText('성별을 선택해주세요.')).toBeInTheDocument();
    });
  });

  describe('다음 버튼 동작 – 정상 통과 케이스', () => {
    it('동의 + 성별 선택 시 2단계(생년월일)로 이동한다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();

      // 동의 체크
      await user.click(screen.getByRole('checkbox'));
      // 남성 선택
      await user.click(screen.getByTestId('gender-male'));
      // 다음
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByTestId('birthdate-select')).toBeInTheDocument();
      });
    });

    it('2단계로 이동 시 프로그레스 바가 2/4로 업데이트된다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();

      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByTestId('gender-female'));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('2/4');
      });
    });
  });

  describe('에러 메시지 초기화', () => {
    it('에러 발생 후 체크박스를 클릭하면 에러 메시지가 사라진다', async () => {
      const user = userEvent.setup();
      await renderWithMockUser();

      // 에러 유발
      await user.click(screen.getByRole('button', { name: '다음' }));
      expect(screen.getByText('개인정보 수집·이용에 동의해주세요.')).toBeInTheDocument();

      // 체크박스 클릭 시 에러 초기화
      await user.click(screen.getByRole('checkbox'));
      expect(
        screen.queryByText('개인정보 수집·이용에 동의해주세요.')
      ).not.toBeInTheDocument();
    });
  });
});
