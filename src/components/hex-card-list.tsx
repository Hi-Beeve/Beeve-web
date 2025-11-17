import React from "react";

export default function HexCardList() {
  return (
    <section style={{ width: '100%', background: '#f6f4fa', padding: '20px 0', borderRadius: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '16px 20px', borderRadius: 16, margin: '0 16px 12px 16px' }}>
        <img src="/profile.png" alt="profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 19 }}>정승은</div>
          <div style={{ fontSize: 15, color: '#666', marginTop: 2 }}>신체정보 <span style={{ fontWeight: 600 }}>160cm / 52kg</span></div>
          <div style={{ fontSize: 15, color: '#666' }}>나이(만) <span style={{ fontWeight: 600 }}>29세</span></div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, margin: '0 16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <span style={{ fontWeight: 700, fontSize: 19 }}>2등급</span>
        <span style={{ fontSize: 15, color: '#888' }}>등급판단이유는 이러이러하여 나오게 되었습니다.</span>
      </div>
    </section>
  );
}
