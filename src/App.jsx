import React from 'react';
import Dota95Map from './components/dota95/Dota95Map';

export default function App() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06080d] text-slate-100 flex flex-col font-sans select-none">
      <Dota95Map />
    </main>
  );
}
