'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import type { UserWeightStats } from '@/core/controllers/ranking'
import {
  IconTrophy,
  IconMinus,
  IconArrowDown,
  IconArrowUp,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

type RankingEntry = UserWeightStats & {
  rank: number
  weeklyLossRate: number
  totalLoss: number
}

function computeRanking(stats: UserWeightStats[]): RankingEntry[] {
  const now = Date.now()
  return stats
    .map((s) => {
      const weeksDiff = (now - new Date(s.firstDate).getTime()) / WEEK_MS
      const weeklyLossRate =
        weeksDiff > 0 ? (s.firstWeight - s.lastWeight) / weeksDiff : 0
      const totalLoss = s.firstWeight - s.lastWeight
      return {
        ...s,
        weeklyLossRate: Math.round(weeklyLossRate * 100) / 100,
        totalLoss: Math.round(totalLoss * 10) / 10,
      }
    })
    .sort((a, b) => b.weeklyLossRate - a.weeklyLossRate)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

function RankBadge({ rank }: { rank: number }) {
  if (MEDAL[rank]) {
    return (
      <span className="text-2xl w-8 text-center select-none">
        {MEDAL[rank]}
      </span>
    )
  }
  return (
    <span className="w-8 text-center text-sm font-semibold text-muted-foreground">
      {rank}
    </span>
  )
}

function LossIndicator({ rate }: { rate: number }) {
  if (rate > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-green-500 font-semibold text-sm">
        <IconArrowDown size={14} />
        {rate.toFixed(2)} kg/wk
      </span>
    )
  if (rate < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold text-sm">
        <IconArrowUp size={14} />
        {Math.abs(rate).toFixed(2)} kg/wk
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground text-sm">
      <IconMinus size={14} />
      0.00 kg/wk
    </span>
  )
}
import { AnimatedList } from '@/components/ui/animated-list'
import { AuroraText } from '../ui/aurora-text'
export default function RankingList() {
  const { data: session } = useSession()
  const { data: rawData, isLoading } = useQuery<UserWeightStats[]>({
    queryKey: ['ranking'],
    queryFn: async () => {
      const res =
        await axios.get<ApiResponse<UserWeightStats[]>>('/api/ranking')
      return res.data.data ?? []
    },
  })

  const ranking = useMemo<RankingEntry[]>(
    () => computeRanking(rawData ?? []).slice(0, 10),
    [rawData],
  )

  return (
    <div className="w-full flex flex-col gap-3 ">
      <div className="flex items-center gap-2 w-full justify-center">
        <h2 className="font-bold text-4xl text-center">
          <AuroraText>อันดับลดน้ำหนัก</AuroraText>
        </h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        จัดอันดับตามอัตราลดน้ำหนักเฉลี่ยต่อสัปดาห์
      </p>

      {isLoading && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          กำลังโหลด...
        </div>
      )}

      {!isLoading && (!ranking || ranking.length === 0) && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูล
        </div>
      )}

      {ranking && ranking.length > 0 && (
        <AnimatedList className="flex flex-col-reverse gap-2" delay={100}>
          {ranking.map((entry) => {
            const isMe =
              session?.user?.id === entry.userId ||
              session?.user?.email === entry.userId
            return (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  isMe
                    ? 'border-primary/40 bg-primary/5'
                    : 'bg-white dark:bg-black hover:bg-muted/30',
                )}
              >
                <RankBadge rank={entry.rank} />

                <div className="relative size-10 shrink-0 rounded-full overflow-hidden bg-muted">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={
                        entry.image.includes('.svg') ||
                        entry.image.includes('dicebear.com')
                      }
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
                      {entry.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium truncate text-sm">
                    {entry.name}
                    {isMe && (
                      <span className="ml-1.5 text-xs text-primary font-normal">
                        (คุณ)
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.firstWeight} → {entry.lastWeight} kg ·{' '}
                    {entry.totalRecords} ครั้ง ·{' '}
                    {Math.round(
                      (new Date(entry.lastDate).getTime() -
                        new Date(entry.firstDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{' '}
                    วัน
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <LossIndicator rate={entry.weeklyLossRate} />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      entry.totalLoss > 0
                        ? 'text-green-500'
                        : entry.totalLoss < 0
                          ? 'text-red-500'
                          : 'text-muted-foreground',
                    )}
                  >
                    รวม{' '}
                    {entry.totalLoss > 0 ? '-' : entry.totalLoss < 0 ? '+' : ''}
                    {Math.abs(entry.totalLoss).toFixed(1)} kg
                  </span>
                </div>
              </div>
            )
          })}
        </AnimatedList>
      )}
    </div>
  )
}
