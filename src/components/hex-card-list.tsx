import React from "react";
import { HexUserProfile, HexGradeInfo } from "@/types/hex";

interface HexCardListProps {
  user: HexUserProfile;
  gradeInfo: HexGradeInfo;
}

export default function HexCardList({ user, gradeInfo }: HexCardListProps) {
  return (
    <section style={{ width: '100%', background: '#f6f4fa', padding: '20px 0', borderRadius: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '16px 20px', borderRadius: 16, margin: '0 16px 12px 16px' }}>
        <img src={user.profileImage} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 19 }}>{user.name}</div>
          <div style={{ fontSize: 15, color: '#666', marginTop: 2 }}>신체정보 <span style={{ fontWeight: 600 }}>{user.height}cm / {user.weight}kg</span></div>
          <div style={{ fontSize: 15, color: '#666' }}>나이(만) <span style={{ fontWeight: 600 }}>{user.age}세</span></div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, margin: '0 16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <span style={{ fontWeight: 700, fontSize: 19 }}>{gradeInfo.grade}</span>
        <span style={{ fontSize: 15, color: '#888' }}>{gradeInfo.description}</span>
      </div>
    </section>
  );
}
