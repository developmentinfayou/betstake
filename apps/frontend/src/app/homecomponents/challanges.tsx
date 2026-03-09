import React from "react";

const Challenge = () => {
  const games = [
    {
      id: 1,
      title: "Boom Balloon",
      image: "/images/limbo.png",
      winners: "27.8K",
      reward: "0.01000000 BTC",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing Lorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscing elit..."
    },
    {
      id: 2,
      title: "Crash X",
      image: "/images/mines.png",
      winners: "18.2K",
      reward: "0.00500000 BTC",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna Lorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscing aliqua..."
    },
    {
      id: 3,
      title: "Dice Roll",
      image: "/images/dice.svg",
      winners: "9.4K",
      reward: "0.00200000 BTC",
      description:
        "Ut enim ad minim veniam, quis nostrud Lorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscing Lorem ipsum dolor sit amet, consectetur adipiscing exercitation..."
    },
    {
      id: 4,
      title: "Plinko",
      image: "/images/plinko.png",
      winners: "2.4K",
      reward: "0.00200000 BTC",
      description:
        "Ut enim ad minim veniam, quis nostrud Lorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscing Lorem ipsum dolor sit amet, consectetur adipiscing exercitation..."
    },
    {
      id: 5,
      title: "Flip",
      image: "/images/flip.png",
      winners: "12.4K",
      reward: "0.00200000 BTC",
      description:
        "Ut enim ad minim veniam, quis nostrud Lorem ipsum dolor sit amet, consectetur adipiscingLorem ipsum dolor sit amet, consectetur adipiscing Lorem ipsum dolor sit amet, consectetur adipiscing exercitation..."
    },
    {
      id: 6,
      title: "Dice",
      image: "/images/dice.svg",
      winners: "58.8K",
      reward: "0.00200000 BTC",
      description: "Classic dice game with live players."
    },
    {
      id: 7,
      title: "Mines",
      image: "/images/mines.png",
      winners: "58.8K",
      reward: "0.00300000 BTC",
      description: "Avoid mines and win big rewards."
    },
    {
      id: 8,
      title: "Plinko",
      image: "/images/plinko.png",
      winners: "58.8K",
      reward: "0.00250000 BTC",
      description: "Drop the ball and test your luck."
    },
    {
      id: 9,
      title: "Coin Flip",
      image: "/images/flip.png",
      winners: "27.8K",
      reward: "0.00150000 BTC",
      description: "Simple heads or tails game."
    },
    {
      id: 10,
      title: "Limbo",
      image: "/images/limbo.png",
      winners: "58.8K",
      reward: "0.00400000 BTC",
      description: "High risk, high reward limbo game."
    },
    {
      id: 11,
      title: "Pump",
      image: "/images/pump.png",
      winners: "58.8K",
      reward: "0.00350000 BTC",
      description: "Pump before it bursts."
    },
    {
      id: 12,
      title: "Pump",
      image: "/images/mines.png",
      winners: "58.8K",
      reward: "0.00350000 BTC",
      description: "Pump before it bursts."
    },
    {
      id: 13,
      title: "Pump",
      image: "/images/dice.svg",
      winners: "58.8K",
      reward: "0.00350000 BTC",
      description: "Pump before it bursts."
    },



  ];

  const [activeIndex, setActiveIndex] = React.useState(1);

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? games.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((prev) =>
      prev === games.length - 1 ? 0 : prev + 1
    );
  };

  const activeGame = games[activeIndex];

  return (
    <div className="mt-2 flex justify-center">
      <div className="w-full max-w-[1240px] py-20 text-gray-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex relative items-center space-x-4 w-full justify-between">
            <div className="w-full max-w-[1240px] py-16 text-gray-300 px-4">
              {/* TOP NAV ROW */}
              <div className="flex items-center mb-3 gap-[40px]">
                {/* Arrows Box (width matches cover width) */}
                <div className="w-[100px] flex space-x-2 items-center">
                  <button onClick={prevSlide} className="py-[3px] px-2 w-[24px] h-[24px] bg-[#1a1c2e] text-[#8A9098] rounded hover:bg-white/10 transition flex items-center justify-center">
                    <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7L1 4L4 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button onClick={nextSlide} className="py-[3px] px-2 w-[24px] h-[24px] bg-white text-black rounded hover:bg-gray-200 transition flex items-center justify-center">
                    <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7L4 4L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {/* Title Row */}
                <div className="flex gap-5 items-center flex-1">
                  <span className="text-[14px] font-medium tracking-wide text-gray-500">Challenges</span>
                  <span className="text-[14px] font-medium tracking-wide text-[#FF7643] underline cursor-pointer underline-offset-[3px] decoration-[#FF7643]/50">View All</span>
                </div>
              </div>

              {/* CONTENT ROW */}
              <div className="relative mt-2">
                {/* Blurred Background Cards Carousel (Behind Content) */}
                <div className="absolute top-[-180px] -left-[100vw] w-[300vw] flex items-center justify-center gap-[12px] overflow-hidden pointer-events-none z-0 opacity-25">
                  {[...games, ...games, ...games, ...games, ...games].map((game, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center justify-center blur-md opacity-70">
                      <img
                        src={game.image}
                        className="w-[100px] h-[500px] object-contain"
                        alt=""
                      />
                    </div>
                  ))}
                </div>

                <div className="flex relative flex-col md:flex-row gap-[40px] items-start z-10 pt-1">
                  {/* Active Game Cover */}
                  <div className="relative flex-shrink-0 w-[100px]">
                    <div className="w-[100px] h-[132px] rounded border border-white/5 bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 flex items-center justify-center shadow-lg overflow-hidden relative">
                      {/* Simulated inner graphic, like "9000x" banner on a balloon */}
                      <div className="absolute inset-0 bg-white/10"></div>
                      <img src={activeGame.image} className="w-[85%] h-[85%] object-contain -rotate-[15deg] scale-110 drop-shadow-lg drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" alt={activeGame.title} />
                    </div>
                    <div className="mt-4 w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[55%] h-full bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Active Game Info */}
                  <div className="flex-grow flex-1 w-full pt-1">
                    <div className="flex items-center mb-3 gap-4 w-full max-w-[850px]">
                      <p className="text-[19px] font-bold text-white tracking-wide">
                        {activeGame.title}
                      </p>
                      <span className="px-[8px] py-[3px] text-[11px] font-bold tracking-widest text-[#8A9098] bg-[#1a1c2e]/80 border border-white/5 rounded items-center flex uppercase">
                        <span className="text-[#FF7643] mr-1.5 text-[16px] leading-none">+</span> ORBEiT Originals
                      </span>

                      {/* Winners pushed to right */}
                      <div className="flex items-center space-x-1.5 ml-auto">
                        <span className="text-[#FF7643] text-[15px]">🏆</span>
                        <span className="text-white font-bold tracking-wide text-[13px]">{activeGame.winners}</span>
                        <span className="tracking-wide text-gray-500 text-[13px]">~Winners</span>
                      </div>
                    </div>

                    <p className="text-[16px] leading-[24px] tracking-wide text-[#8A94A6] font-normal mb-5 max-w-[850px]">
                      {activeGame.description.length > 150
                        ? activeGame.description.substring(0, 150) + "..."
                        : activeGame.description}
                      <span className="text-[#FF7643] cursor-pointer underline ml-2 underline-offset-[3px] decoration-[#FF7643]/40 hover:decoration-[#FF7643]">
                        see more
                      </span>
                    </p>

                    <div className="flex items-center space-x-5">
                      <button className="py-[9px] text-center text-[14px] px-6 font-bold tracking-widest bg-[#FF4500] text-white rounded hover:bg-[#ff5511] transition shadow-[0_4px_14px_0_rgba(255,69,0,0.4)]">
                        Complete Challenge
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#FF7643] text-[17px]">🎁</span>
                        <span className="text-[14px] font-bold tracking-wider text-gray-300">
                          {activeGame.reward}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
