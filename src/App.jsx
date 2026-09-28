import React, { useState } from 'react';
import DotaMapEditor from './components/dota95/DotaMapEditor';
import Dota95Map from './components/dota95/Dota95Map';

export default function App() {
  const [mode, setMode] = useState('GAME'); // 'GAME' | 'EDITOR'

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06080d] text-slate-100 flex flex-col font-sans select-none">
      {mode === 'EDITOR' ? (
        <DotaMapEditor onSwitchMode={setMode} />
      ) : (
        <Dota95Map onSwitchMode={setMode} />
      )}
    </main>
  );
}
