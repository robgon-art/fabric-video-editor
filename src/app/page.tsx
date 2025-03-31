'use client';

import dynamic from 'next/dynamic'

const DynmicEditor = dynamic(() => import('../components/Editor').then(a => a.EditorWithStore), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <DynmicEditor />
    </main>
  );
}
