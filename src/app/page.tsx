'use client'

import DockNavigate from '@/components/app/dock-navigate'
import RankingList from '@/components/app/ranking-list'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col pt-8 pb-28 px-4 md:px-16 bg-white dark:bg-black">
        <RankingList />
      </main>
      <DockNavigate />
    </div>
  )
}
