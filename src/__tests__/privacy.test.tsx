import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage, { metadata } from '@/app/privacy/page';

describe('개인정보처리방침 페이지 (/privacy)', () => {
  it('페이지가 정상적으로 렌더링된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('메인 제목이 "개인정보처리방침"으로 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
  });

  it('서비스 설명 문구가 표시된다', () => {
    render(<PrivacyPage />);
    expect(
      screen.getByText(/Hi,Beeve.*이용자의 개인정보를 소중히/)
    ).toBeInTheDocument();
  });

  it('8개의 섹션 제목이 모두 표시된다', () => {
    render(<PrivacyPage />);

    const expectedSections = [
      '1. 수집하는 개인정보',
      '2. 개인정보의 이용 목적',
      '3. 개인정보 보유 및 이용 기간',
      '4. 개인정보의 제3자 제공',
      '5. 동의 거부 시 불이익',
      '6. 의료 면책',
      '7. AI 기술 사용 안내',
      '8. 개인정보처리자 정보',
    ];

    for (const title of expectedSections) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('1섹션: 수집 항목(이메일, 이름, 체력 측정 데이터 등)이 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('이메일 주소 (회원가입)')).toBeInTheDocument();
    expect(screen.getByText('이름, 생년월일, 성별 (체력측정)')).toBeInTheDocument();
    expect(screen.getByText('신장, 체중, 체력 측정 데이터')).toBeInTheDocument();
  });

  it('3섹션: 탈퇴 후 1년 보관 문구가 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('1년 후 완전 삭제')).toBeInTheDocument();
  });

  it('4섹션: Google Gemini API 제공 정보가 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('Google Gemini API (AI 운동 추천)')).toBeInTheDocument();
    expect(screen.getByText('처리 즉시 삭제')).toBeInTheDocument();
  });

  it('8섹션: 문의 이메일이 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('beeve.test@gmail.com')).toBeInTheDocument();
  });

  it('최종 수정일이 표시된다', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/최종 수정일/)).toBeInTheDocument();
  });

  describe('metadata', () => {
    it('title이 올바르게 설정된다', () => {
      expect(metadata.title).toBe('개인정보처리방침 - Hi,Beeve');
    });

    it('description이 올바르게 설정된다', () => {
      expect(metadata.description).toBe('Hi,Beeve 서비스 개인정보처리방침');
    });
  });
});
