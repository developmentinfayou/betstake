'use client';

import Link from 'next/link';
import Challenge from './homecomponents/challanges';
import HomeFooter from './homecomponents/homefooter';
import ContestWinnerList from './homecomponents/contestWinnerList';

const games = [
  { id: 'dice', name: 'Dice', players: '58.8K', status: 'live' },
  { id: 'mines', name: 'Mines', players: '58.8K', status: 'live' },
  { id: 'plinko', name: 'Plinko', players: '58.8K', status: 'live' },
  { id: 'coinflip', name: 'Coin Flip', players: '27.8K', status: 'live' },
  { id: 'limbo', name: 'Limbo', players: '58.8K', status: 'live' },
  { id: 'pump', name: 'Pump', players: '58.8K', status: 'live' },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(8,8,25,1) 100%)',
      }}
    >
      {/* ✅ HEADER */}
      <header className="border-b border-[#31313F]">
        <div className="mx-auto flex h-[81px] max-w-[1440px] items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <div className="h-[26px] w-[26px] rounded-full bg-[#73FFD7]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[19px] tracking-[0.08em]">OREBIT</span>
              <span className="text-[#73FFD7] text-[14px] tracking-[0.08em]">
                ~Play
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-3 rounded bg-[#73FFD7]/5 p-2">
              <button className="rounded bg-white/5 px-3 py-2 text-sm flex items-center gap-1">
             <img src='/imgs/Solid.png' />   Dashboard
              </button>
              <button className="px-3 py-2 text-sm text-[#828282]">
                Casino
              </button>
              <button className="px-3 py-2 text-sm text-[#828282]">
                Multiplayer
              </button>
            </div>

            <div className="flex items-center gap-4 rounded border border-[#31313F] px-4 py-2 text-sm">
              <span className="text-white">Blackjack</span>
              <span className="text-[#828282]">Slots</span>
              <span className="text-[#828282]">Poker</span>
              <span className="text-[#828282]">Baccarat</span>
              <span className="text-[#828282]">Roulette</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="rounded border border-[#31313F] px-4 py-2 text-sm">
              Spin
            </button>
            <button className="rounded border border-[#31313F] px-4 py-2 text-sm">
              Winner CrispyPotato 🎉
            </button>
          </div>
        </div>
      </header>

      {/* ✅ PAGE CONTAINER */}
      <main className="mx-auto max-w-[1440px] px-8 pb-20 pt-8">
        {/* ✅ TOP CARDS ROW */}
        <section className="grid gap-3 lg:grid-cols-[592px_335px_1fr]">
          {/* Jackpot card */}
          <div className="rounded border border-[#31313F] p-4">
            <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
              Jackpot!
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs tracking-[0.08em]">
              <span className="font-semibold text-[#FF9169]">Bitcoin</span>
              <span className="text-white/20">Tron</span>
              <span className="text-white/20">Dash</span>
              <span className="text-white/20">Litecoin</span>
              <span className="text-white/20">Dogecoin</span>
            </div>

            <div className="mt-3 border-b border-dashed border-[#828282] pb-2 text-2xl font-semibold tracking-[0.08em]">
              0.0021780 BTC
            </div>
          </div>

          {/* Rakeback card */}
          <div className="rounded border border-[#31313F] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold underline decoration-dashed">
                  14.18%
                </span>
                <span className="rounded bg-[#25A655] px-2 py-0.5 text-xs">
                  ▲ 23.1%
                </span>
              </div>
              <button className="rounded bg-[#FF4500] px-4 py-2 text-sm">
                Claim
              </button>
            </div>

            <div className="mt-2 text-sm text-[#C1C1C1]">
              5412.81 INR
            </div>

            <div className="mt-3 text-xs tracking-[0.08em] text-[#5B5B79]">
              Rakeback
            </div>
          </div>

          {/* Premium card */}
          <div className="rounded border border-[#31313F] p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 rounded bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-2">
                <button className="rounded bg-white/5 px-3 py-2 text-sm">
                  Premium
                </button>
                <button className="px-3 py-2 text-sm text-[#828282]">
                  VIP
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold underline decoration-dashed">
                  9.01%
                </span>
                <span className="rounded bg-[#25A655] px-2 py-0.5 text-xs">
                  ▼ 18.6%
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#828282]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>

            <div className="mt-3 text-xs tracking-[0.08em] text-[#5B5B79]">
              House Edge
            </div>
          </div>
        </section>

        {/* ✅ RECENTLY PLAYED */}
        <section className="mt-10">
          <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
            Recently Played
          </div>

          <div className="mt-3 flex gap-6 overflow-x-auto pb-2">
            {['FLIP', 'Continue', 'WHEEL', 'DICE', 'LIMBO'].map((t, i) => (
              <div
                key={i}
                className="relative h-[187px] w-[147px] flex-shrink-0 rounded border border-[#32323F] bg-white/5"
              >
                {t === 'Continue' && (
                  <button className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-[#FF4500] px-4 py-2 text-sm">
                    ► Continue
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ✅ MAIN GRID + TRENDING */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_385px]">
          {/* LEFT: games */}
          <div>
            {/* search/filter row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-[26px] items-center gap-3 rounded border border-[#31313F] px-3">
                  <div className="h-3 w-3 rounded-full border border-[#73FFD7]" />
                  <input
                    placeholder="Search games..."
                    className="h-[26px] bg-transparent text-xs tracking-[0.08em] text-[#424252] outline-none"
                  />
                </div>

                <button className="h-[26px] rounded border border-[#31313F] px-4 text-xs text-[#424252]">
                  Filter
                </button>

                <span className="text-xs text-[#AEAEAE]">
                  Sort by: Players Count
                </span>
              </div>
            </div>

            {/* games grid */}
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
              {games.map((g) => {
                const isLive = g.status === 'live';
                return (
                  <Link
                    key={g.id}
                    href={isLive ? `/game/${g.id}` : '#'}
                    className="group relative h-[163px] w-[123px] overflow-hidden rounded border border-[#32323F] bg-white/10 hover:border-[#73FFD7]/60"
                  >
                    <div className="p-3">
                      <div className="h-[92px] rounded bg-white/10" />
                      <div className="mt-2 text-sm tracking-[0.08em]">
                        {g.name}
                      </div>
                      <div className="mt-1 text-xs text-[#828282]">
                        👤 {g.players}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                      <div className="rounded bg-[#FF4500] px-4 py-2 text-sm opacity-0 group-hover:opacity-100 transition">
                        ► Play
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: trending */}
          <aside className="rounded border border-[#31313F] bg-white/5 p-4">
            <div className="text-lg font-semibold tracking-[0.08em]">
              TRENDING
            </div>
            <p className="mt-3 text-xs text-[#828282]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
            <button className="mt-4 rounded bg-[#FF4500] px-4 py-2 text-sm">
              ORBIT Originals
            </button>
          </aside>
        </section>

        {/* ✅ LEADERBOARD */}
        {/* <section className="mt-10">
      

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[74px] rounded border border-[#31313F] bg-white/5"
              />
            ))}
          </div>
        </section> */}

        {/* ✅ CHALLENGES */}
        {/* <section className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
              Challenges
            </div>
            <Link href="#" className="text-xs text-[#FF9169] underline">
              View All
            </Link>
          </div>

          <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-[114px] w-[86px] flex-shrink-0 rounded border border-[#32323F] bg-white/5"
              />
            ))}
          </div>
        </section> */}
        <ContestWinnerList />
        <Challenge />
        <HomeFooter />
      </main>

    
    </div>
  );
}
