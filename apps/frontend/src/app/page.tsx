'use client';

import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Navigation items configuration
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'casino', label: 'Casino' },
    { id: 'multiplayer', label: 'Multiplayer' },
  ];

  // State for game category tabs
  const [activeGameTab, setActiveGameTab] = useState<string>('blackjack');

  // Game category tabs configuration
  const gameTabs = [
    { id: 'blackjack', name: 'Blackjack' },
    { id: 'slots', name: 'Slots' },
    { id: 'poker', name: 'Poker' },
    { id: 'baccarat', name: 'Baccarat' },
    { id: 'roulette', name: 'Roulette' },
  ];

  // Get underline position based on active game tab
  const getUnderlinePosition = () => {
    switch (activeGameTab) {
      case 'blackjack': return 0;
      case 'slots': return 105;
      case 'poker': return 189;
      case 'baccarat': return 271;
      case 'roulette': return 372;
      default: return 0;
    }
  };

  // Render game icon based on id and active state
  const renderGameIcon = (id: string, isActive: boolean) => {
    const activeColor = 'white';
    const inactiveColor = '#818181';
    const color = isActive ? activeColor : inactiveColor;

    switch (id) {
      case 'blackjack':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Two playing cards overlapping - like in Figma */}
            <path d="M2 2L4 10L6 9L4 1L2 2Z" fill={color} />
            <path d="M10 2L8 10L6 9L8 1L10 2Z" fill={color} />
          </svg>
        );
      case 'slots':
        return (
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 777 slot machine style */}
            <text x="0" y="10" fontFamily="Arial" fontSize="11" fontWeight="bold" fill={color}>7</text>
            <text x="6" y="10" fontFamily="Arial" fontSize="11" fontWeight="bold" fill={color}>7</text>
            <text x="12" y="10" fontFamily="Arial" fontSize="9" fontWeight="bold" fill={color}>7</text>
          </svg>
        );
      case 'poker':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Poker chip / star */}
            <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1" />
            <circle cx="6" cy="6" r="2.5" stroke={color} strokeWidth="1" />
            <path d="M6 1V3" stroke={color} strokeWidth="0.8" />
            <path d="M6 9V11" stroke={color} strokeWidth="0.8" />
            <path d="M1 6H3" stroke={color} strokeWidth="0.8" />
            <path d="M9 6H11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
      case 'baccarat':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Diamond/gem shape for baccarat */}
            <path d="M6 1L10 5L6 11L2 5L6 1Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
            <path d="M2 5H10" stroke={color} strokeWidth="0.8" />
            <path d="M6 1L4 5L6 11" stroke={color} strokeWidth="0.8" />
            <path d="M6 1L8 5L6 11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
      case 'roulette':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Roulette wheel */}
            <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1" />
            <circle cx="6" cy="6" r="2" stroke={color} strokeWidth="1" />
            <path d="M6 1V4" stroke={color} strokeWidth="0.8" />
            <path d="M6 8V11" stroke={color} strokeWidth="0.8" />
            <path d="M1 6H4" stroke={color} strokeWidth="0.8" />
            <path d="M8 6H11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render icon based on id and active state
  const renderNavIcon = (id: string, isActive: boolean) => {
    const activeColor = '#73FFD7';
    const inactiveColor = '#818181';
    const color = isActive ? activeColor : inactiveColor;

    switch (id) {
      case 'dashboard':
        return (
          <div
            className="relative flex items-center justify-center"
            style={isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="6" fill={color} />
              <path d="M3.5 6L5.5 8L8.5 4" stroke={isActive ? '#0a0a0a' : '#ffffff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'casino':
        return (
          <div
            className="relative flex items-center justify-center"
            style={isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}}
          >
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1C6 1 11 4 11 7.5C11 10 9 12 6 12C3 12 1 10 1 7.5C1 4 6 1 6 1Z" fill={color} />
              <ellipse cx="6" cy="12.5" rx="2" ry="1" fill={color} />
            </svg>
          </div>
        );
      case 'multiplayer':
        return (
          <div
            className="relative flex items-center justify-center"
            style={isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}}
          >
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Front person (larger) */}
              <circle cx="5" cy="3" r="2.5" fill={color} />
              <path d="M0 11C0 8 2.5 6 5 6C7.5 6 10 8 10 11" fill={color} />
              {/* Back person (smaller, offset) */}
              <circle cx="11" cy="4" r="2" fill={color} />
              <path d="M7 11.5C7 9 9 7 11 7C13 7 15 9 15 11.5" fill={color} />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

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
            <nav
              className="inline-flex items-start gap-3 p-1.5 bg-[#73ffd70f] rounded overflow-hidden"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${isActive
                      ? 'bg-[#ffffff0f]'
                      : 'bg-transparent hover:bg-[#ffffff08]'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                    type="button"
                  >
                    {renderNavIcon(item.id, isActive)}
                    <span
                      className={`font-['Barlow_Condensed'] text-sm tracking-[1.12px] ${isActive ? 'text-white' : 'text-[#818181]'
                        }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Game Category Tabs */}
            <nav
              className="relative w-[462px] h-[41px] rounded overflow-hidden border border-[#31313F]"
              role="navigation"
              aria-label="Casino games navigation"
            >
              <div className="flex items-center h-full px-3">
                {gameTabs.map((tab, index) => {
                  const isActive = activeGameTab === tab.id;
                  return (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => setActiveGameTab(tab.id)}
                        className="flex items-center gap-1.5 px-2 cursor-pointer transition-colors duration-200 hover:opacity-80"
                        aria-label={`Navigate to ${tab.name}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {renderGameIcon(tab.id, isActive)}
                        <span
                          className={`font-['Barlow_Condensed'] text-sm tracking-[1.12px] ${isActive ? 'text-white' : 'text-[#818181]'
                            }`}
                        >
                          {tab.name}
                        </span>
                      </button>
                      {/* Separator - don't show after last item */}
                      {index < gameTabs.length - 1 && (
                        <div className="w-px h-4 bg-[#31313F] mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Animated glowing underline indicator */}
              <div
                className="absolute bottom-0 left-3 w-[73px] h-px bg-[#73FFD7] transition-all duration-300"
                style={{
                  transform: `translateX(${getUnderlinePosition()}px)`,
                  boxShadow: '0px 0px 16px 2px rgba(115, 255, 215, 0.64)',
                }}
                aria-hidden="true"
              />
            </nav>
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
          <div className="flex flex-col gap-1.5">
            <div className="relative h-[86px] w-full rounded overflow-hidden border border-[#31313F]">
              {/* Glow effect */}
              <div
                className="absolute top-[29px] left-[274px] w-px h-px rounded"
                style={{ boxShadow: '0px 0px 24px 6px #ff4500' }}
                aria-hidden="true"
              />

              {/* Game cards row - left side */}
              <div className="absolute top-3 left-[-107px] inline-flex h-[62px] items-center gap-3">
                {/* Plinko card */}
                <div className="relative self-stretch mt-[-145px] w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-pink-400 via-purple-300 to-pink-300 flex items-center justify-center overflow-hidden">
                  <span className="text-[8px] font-bold text-purple-800 tracking-wider">PLINKO</span>
                </div>
                {/* Dice card */}
                <div className="relative self-stretch w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white tracking-wider">DICE</span>
                </div>
                {/* Plinko variant card */}
                <div className="relative self-stretch w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-pink-300 via-orange-200 to-yellow-200 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-purple-700 tracking-wider">PLINKO</span>
                </div>
                {/* Mines card */}
                <div className="relative self-stretch w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-green-400 via-emerald-400 to-teal-300 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white tracking-wider">MINES</span>
                </div>
                {/* Additional cards */}
                <div className="relative self-stretch w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white tracking-wider">SLOTS</span>
                </div>
                <div className="relative self-stretch w-[48px] aspect-[0.78] rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white tracking-wider">WHEEL</span>
                </div>
              </div>

              {/* Orange glow on right */}
              <div
                className="absolute top-14 left-[484px] w-0.5 h-[3px] bg-[#d9d9d9] rounded"
                style={{ boxShadow: '0px 0px 48px 14px #db5506' }}
                aria-hidden="true"
              />

              {/* Crypto tabs */}
              <nav className="absolute top-[18px] left-[267px] flex w-[307px] h-3.5 items-center gap-4 overflow-hidden">
                {['Bitcoin', 'Tron', 'Dash', 'Litecoin', 'Dogecoin', 'Tron', 'Dogecoin'].map((crypto, index) => (
                  <button
                    key={index}
                    className={`relative w-fit mt-[-1px] whitespace-nowrap text-xs tracking-[0.96px] leading-normal ${index === 0
                      ? "font-['Barlow_Condensed'] font-semibold text-[#ff9168]"
                      : "font-['Barlow_Condensed'] font-light text-white opacity-[0.24]"
                      }`}
                  >
                    {crypto}
                  </button>
                ))}
              </nav>

              {/* Jackpot amount */}
              <div className="absolute top-[38px] left-[266px] w-[146px] h-[31px] flex border-b border-dashed border-[#818181]">
                <span className="w-36 h-[29px] font-['Barlow_Condensed'] font-semibold text-white text-2xl tracking-[1.92px] leading-normal">
                  0.0021780 BTC
                </span>
              </div>

              {/* Treasure illustration - stylized with gradient */}
              <div
                className="absolute w-[30.07%] h-[91.07%] top-[54.47%] left-[66.89%] -translate-y-1/2"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 30%, transparent 70%)',
                }}
              >
                {/* Coin representations */}
                <div className="absolute bottom-0 right-4 flex flex-wrap gap-1 opacity-80">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 shadow-lg" />
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 shadow-lg" />
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-lg" />
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 shadow-lg" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg" />
                </div>
              </div>
            </div>

            {/* Jackpot label */}
            <p className="font-['Barlow_Condensed'] text-xs tracking-[0.96px] leading-normal text-[#5b5b79]">
              Jackpot!
            </p>
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

          {/* House Edge card */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-[85px]">
              {/* Glow effect */}
              <div
                className="absolute top-[27px] left-[38px] w-[3px] h-[3px] bg-[#d9d9d9] rounded"
                style={{ boxShadow: '0px 0px 64px 12px #ffa701' }}
                aria-hidden="true"
              />

              <div className="flex flex-col w-full items-start gap-1.5 p-3 rounded overflow-hidden border border-[#31313F]">
                {/* Header with badges and stats */}
                <div className="flex items-center justify-between w-full">
                  {/* Premium/VIP badge tabs */}
                  <div
                    className="inline-flex items-center gap-3 p-1.5 rounded overflow-hidden"
                    style={{ background: 'linear-gradient(148deg, rgba(255, 229, 0, 0.06) 0%, rgba(255, 106, 0, 0.06) 100%)' }}
                  >
                    {/* Premium badge - active */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] rounded">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(148deg, rgba(255, 229, 0, 1) 0%, rgba(255, 106, 0, 1) 100%)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 0L6.12 3.38L9.51 3.82L7.03 6.12L7.64 9.47L5 7.94L2.36 9.47L2.97 6.12L0.49 3.82L3.88 3.38L5 0Z" fill="#1a1a1a" />
                        </svg>
                      </div>
                      <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-white">
                        Premium
                      </span>
                    </div>

                    {/* VIP badge - inactive */}
                    <div className="inline-flex items-center gap-1.5 px-[9px] py-1.5">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 0L9.5 3H4.5L7 0Z" fill="#818181" />
                        <path d="M1 3H13L12 9H2L1 3Z" fill="#818181" />
                      </svg>
                      <span className="font-['Barlow_Condensed'] text-sm tracking-[1.12px] text-[#818181]">
                        VIP
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="inline-flex items-center gap-4">
                    {/* Percentage icon + value */}
                    <div className="inline-flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="#FF9900" />
                      </svg>
                      <div className="inline-flex items-center border-b border-dashed border-[#818181]">
                        <span className="font-['Barlow_Condensed'] font-semibold text-white text-sm tracking-[1.12px]">
                          9.01%
                        </span>
                      </div>
                    </div>

                    {/* Growth badge */}
                    <div className="inline-flex items-center gap-1 px-[3px] bg-[#24a654] rounded-[3px]">
                      <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5L0 0H6L3 5Z" fill="white" />
                      </svg>
                      <span className="font-['Barlow_Condensed'] text-white text-sm tracking-[1.12px]">
                        18.6%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-['Barlow_Condensed'] font-light text-[#818181] text-xs tracking-[0.96px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
                </p>
              </div>
            </div>

            {/* House Edge label */}
            <span className="font-['Barlow_Condensed'] text-xs tracking-[0.96px] text-[#5b5b79]">
              House Edge
            </span>
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
