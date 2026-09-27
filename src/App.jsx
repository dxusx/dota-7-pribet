import React, { useState } from 'react';
import EditorMode from './components/dota95/EditorMode';
import Dota95Map from './components/dota95/Dota95Map';

export default function App() {
  const [mode, setMode] = useState('EDITOR'); // 'EDITOR' | 'GAME'

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06080d] text-slate-100 flex flex-col font-sans select-none">
      {mode === 'EDITOR' ? (
        <EditorMode onSwitchMode={setMode} />
      ) : (
        <Dota95Map onSwitchMode={setMode} />
      )}
    </main>
  );
}
