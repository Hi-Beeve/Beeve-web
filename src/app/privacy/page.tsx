export const metadata = {
  title: '개인정보처리방침 - Hi,Beeve',
  description: 'Hi,Beeve 서비스 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">개인정보처리방침</h1>
        <p className="text-sm text-[#888] mb-8">Hi,Beeve (이하 "서비스")는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.</p>

        <Section title="1. 수집하는 개인정보">
          <ul className="list-disc pl-5 space-y-1 text-[#444]">
            <li>이메일 주소 (회원가입)</li>
            <li>이름, 생년월일, 성별 (체력측정)</li>
            <li>신장, 체중, 체력 측정 데이터</li>
            <li>운동 목표, 부상/질병 정보 (선택)</li>
          </ul>
        </Section>

        <Section title="2. 개인정보의 이용 목적">
          <ul className="list-disc pl-5 space-y-1 text-[#444]">
            <li>회원 식별 및 서비스 제공</li>
            <li>체력 데이터 분석 및 운동 추천</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </Section>

        <Section title="3. 개인정보 보유 및 이용 기간">
          <ul className="list-disc pl-5 space-y-1 text-[#444]">
            <li>서비스 이용 기간 동안 보유</li>
            <li>회원 탈퇴 시 탈퇴일로부터 <strong>1년 후 완전 삭제</strong></li>
            <li>단, 관계 법령에 따라 보존 의무가 있는 경우 해당 기간 동안 보관</li>
          </ul>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p className="text-[#444] mb-3">Google Gemini API (AI 운동 추천)</p>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-[#eee]">
                <td className="py-2 pr-4 text-[#888] w-28 align-top">제공 항목</td>
                <td className="py-2 text-[#444]">체력 데이터, 운동 목표, 부상 정보</td>
              </tr>
              <tr className="border-b border-[#eee]">
                <td className="py-2 pr-4 text-[#888] align-top">이용 목적</td>
                <td className="py-2 text-[#444]">맞춤형 운동 프로그램 생성</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-[#888] align-top">보유 기간</td>
                <td className="py-2 text-[#444]">처리 즉시 삭제</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="5. 동의 거부 시 불이익">
          <p className="text-[#444] leading-relaxed">
            개인정보 수집·이용에 동의하지 않으실 수 있습니다.
            단, 동의를 거부하실 경우 <strong>서비스 회원가입 및 이용이 제한</strong>됩니다.
          </p>
        </Section>

        <Section title="6. 의료 면책">
          <p className="text-[#444] leading-relaxed">
            본 앱은 의료기기가 아니며, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.
            제공되는 정보는 참고용이며, 건강 이상 시 반드시 전문의와 상담하세요.
          </p>
        </Section>

        <Section title="7. AI 기술 사용 안내">
          <p className="text-[#444] leading-relaxed">
            운동 추천 기능은 Google Gemini AI를 활용합니다.
            AI 생성 콘텐츠는 참고 자료로만 활용하시기 바랍니다.
          </p>
        </Section>

        <Section title="8. 개인정보처리자 정보">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-[#eee]">
                <td className="py-2 pr-4 text-[#888] w-28 align-top">서비스명</td>
                <td className="py-2 text-[#444]">Hi,Beeve</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-[#888] align-top">문의 이메일</td>
                <td className="py-2 text-[#444]">beeve.test@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <p className="text-sm text-[#aaa] mt-10 pt-6 border-t border-[#eee]">
          최종 수정일: 2026년 2월 24일
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-[#1a1a1a] mb-3 pb-2 border-b border-[#eee]">
        {title}
      </h2>
      {children}
    </section>
  );
}
