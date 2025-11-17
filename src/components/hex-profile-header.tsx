import React from "react";

export default function HexProfileHeader() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/profile.png" alt="profile" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        <span style={{ fontWeight: 700, fontSize: 20, color: '#888' }}>Hello! <span style={{ color: '#222' }}>Yeriel</span></span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>🔗</button>
        <button style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>☰</button>
      </div>
    </header>
  );
}
