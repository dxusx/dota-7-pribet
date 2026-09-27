import React from 'react';
import DotaMapEditor from './components/dota95/DotaMapEditor';

export default function App() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06080d] text-slate-100 flex flex-col font-sans select-none">
      <DotaMapEditor />
    </main>
  );
}
