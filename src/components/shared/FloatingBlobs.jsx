import React from 'react';

export default function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="blob-1 absolute rounded-full"
        style={{ background: 'rgba(216,89,140,.28)', filter: 'blur(90px)', width: 520, height: 520, top: '5%', left: '8%' }}
      />
      <div
        className="blob-2 absolute rounded-full"
        style={{ background: 'rgba(157,96,153,.22)', filter: 'blur(90px)', width: 600, height: 600, top: '30%', right: '4%' }}
      />
      <div
        className="blob-3 absolute rounded-full"
        style={{ background: 'rgba(241,194,210,.38)', filter: 'blur(90px)', width: 460, height: 460, bottom: '8%', left: '22%' }}
      />
    </div>
  );
}