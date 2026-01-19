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
        <nav className="mx-auto flex h-[81px] max-w-[1440px] items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <div className="h-[26px] w-[26px] rounded-full bg-[#73FFD7]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-['Barlow_Condensed'] text-[19px] tracking-[0.08em]">ORBIT</span>
              <span className="font-['Barlow_Condensed'] text-[#73FFD7] text-[14px] tracking-[0.08em]">
                ~Play
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Primary Nav Tabs */}
            <div className="flex items-center gap-3 rounded bg-[#73FFD7]/[0.06] p-1.5">
              <button className="flex items-center gap-1.5 rounded bg-white/[0.06] px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.585787 6.41421L5.58579 1.41421C5.96086 1.03914 6.5 0.848858 7 1H10.5C10.7761 1 11 1.22386 11 1.5V5C11.1511 5.5 10.9609 6.03914 10.5858 6.41421L5.58579 11.4142C5.21071 11.7893 4.59214 11.7893 4.21707 11.4142L0.585786 7.78284C0.210714 7.40777 0.210714 6.78929 0.585787 6.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="3.5" r="0.5" fill="white" />
                </svg>
                <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-white">
                  Dashboard
                </span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3H2C1.44772 3 1 3.44772 1 4V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3Z" stroke="#818181" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 1L6 3L4 1" stroke="#818181" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="4" cy="7" r="1" stroke="#818181" />
                  <circle cx="8" cy="7" r="1" stroke="#818181" />
                </svg>
                <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                  Casino
                </span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5">
                <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5.5" cy="2.5" r="2" stroke="#818181" />
                  <path d="M1 11V10C1 8.34315 2.34315 7 4 7H7C8.65685 7 10 8.34315 10 10V11" stroke="#818181" strokeLinecap="round" />
                  <circle cx="11" cy="4" r="1.5" stroke="#818181" />
                  <path d="M11 7C12.6569 7 14 8.34315 14 10V11" stroke="#818181" strokeLinecap="round" />
                </svg>
                <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                  Multiplayer
                </span>
              </button>
            </div>

            {/* Game Category Tabs */}
            <div className="relative flex items-center rounded border border-[#31313F] overflow-hidden">
              <div className="flex items-center p-3 gap-0">
                {/* Blackjack - Active */}
                <button className="flex items-center gap-1.5 pr-4 relative">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 11L1 3C1 2 2 1 3 1L5 9L3 11Z" fill="white" />
                    <path d="M9 11L11 3C11 2 10 1 9 1L7 9L9 11Z" fill="white" />
                  </svg>
                  <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-white">
                    Blackjack
                  </span>
                  {/* Active indicator */}
                  <div className="absolute -bottom-3 left-0 w-full h-px bg-[#73FFD7]" style={{ boxShadow: '0px 0px 16px 2px rgba(115, 255, 215, 0.64)' }} />
                </button>

                <div className="w-px h-4 bg-[#31313F] mx-2" />

                {/* Slots */}
                <button className="flex items-center gap-1.5 px-2">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4H17V10C17 11 16 12 15 12H3C2 12 1 11 1 10V4Z" stroke="#818181" />
                    <path d="M4 4V1C4 0.5 4.5 0 5 0H13C13.5 0 14 0.5 14 1V4" stroke="#818181" />
                  </svg>
                  <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                    Slots
                  </span>
                </button>

                <div className="w-px h-4 bg-[#31313F] mx-2" />

                {/* Poker */}
                <button className="flex items-center gap-1.5 px-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1L7.5 4.5L11 5.5L8 8L9 11.5L6 9.5L3 11.5L4 8L1 5.5L4.5 4.5L6 1Z" stroke="#818181" />
                  </svg>
                  <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                    Poker
                  </span>
                </button>

                <div className="w-px h-4 bg-[#31313F] mx-2" />

                {/* Baccarat */}
                <button className="flex items-center gap-1.5 px-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="5" stroke="#818181" />
                    <path d="M6 3V6L8 8" stroke="#818181" strokeLinecap="round" />
                  </svg>
                  <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                    Baccarat
                  </span>
                </button>

                <div className="w-px h-4 bg-[#31313F] mx-2" />

                {/* Roulette */}
                <button className="flex items-center gap-1.5 pl-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="5" stroke="#818181" />
                    <circle cx="6" cy="6" r="2" stroke="#818181" />
                    <path d="M6 1V3" stroke="#818181" />
                    <path d="M6 9V11" stroke="#818181" />
                    <path d="M1 6H3" stroke="#818181" />
                    <path d="M9 6H11" stroke="#818181" />
                  </svg>
                  <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                    Roulette
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Spin Button */}
            <button className="flex items-center gap-1.5 rounded border border-[#31313F] p-3">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1" stroke="white" strokeLinecap="round" />
                <path d="M6 1L4 3" stroke="white" strokeLinecap="round" />
                <path d="M6 1V4" stroke="white" strokeLinecap="round" />
              </svg>
              <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-white">
                Spin
              </span>
            </button>

            {/* Winner Notification */}
            <div className="flex items-center gap-1.5 rounded border border-[#31313F] p-3 overflow-hidden">
              <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0H11L12 3H3L4 0Z" fill="#FFD700" />
                <path d="M3 3H12V5C12 6.65685 10.6569 8 9 8H6C4.34315 8 3 6.65685 3 5V3Z" fill="#FFD700" />
                <path d="M6 8H9V10C9 10.5523 8.55228 11 8 11H7C6.44772 11 6 10.5523 6 10V8Z" fill="#FFD700" />
                <path d="M5 11H10" stroke="#FFD700" strokeLinecap="round" />
              </svg>
              <p className="font-['Barlow_Condensed'] text-sm tracking-[1.12px]">
                <span className="text-white">Winner </span>
                <span className="text-[#73FFD7]">CrispyPotato</span>
                <span className="text-white"> 🎉</span>
              </p>
            </div>

            {/* Bell Notification */}
            <button className="relative">
              <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1C3.79086 1 2 2.79086 2 5V8L1 10H11L10 8V5C10 2.79086 8.20914 1 6 1Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 10V11C4 12.1046 4.89543 13 6 13C7.10457 13 8 12.1046 8 11V10" stroke="white" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
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
