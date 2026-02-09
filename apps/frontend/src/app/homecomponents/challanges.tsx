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
    <div className="mt-2">
      <div className="w-full px-6 py-20 text-gray-300 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex relative items-center space-x-4  left-[110px]">
          <div className="absolute top-[45px] left-[450px] blureddimage flex items-center justify-center gap-6">
        {games.map((game, index) => (
          <img
            key={game.id}
            src={game.image}
            alt={game.title}
            className={`w-[86px] h-[114px] rounded transition-all duration-500
              ${index === activeIndex
                ? "blur-md scale-95 opacity-30"
                : "blur-md scale-95 opacity-30"}
            `}
          />
        ))}
      </div>
            
            <div className="flex space-x-1 relative -left-[14px] items-center">
              <button onClick={prevSlide} className=" py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] text-white rounded hover:bg-white/50 transition">
                <svg
                  width="4"
                  height="7"
                  viewBox="0 0 4 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 6.5L0.5 3.5L3.5 0.5"
                    stroke="#FEFEFE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button onClick={nextSlide}  className="py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] text-white hover:bg-white/50  rounded transition">
                <svg
                  width="4"
                  height="7"
                  viewBox="0 0 4 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 6.5L3.5 3.5L0.5 0.5"
                    stroke="#FEFEFE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-6 items-center relative left-[37px]">
              <span className="text-xs tracking-wider text-gray-500">
                Challenges
              </span>
              <span className="text-xs tracking-wider  text-[#FF9169]  underline border-orange-500 cursor-pointer">
                View All
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex relative left-[110px] flex-col md:flex-row gap-6 items-start">
            <div className="relative flex-shrink-0">
              <img
                className="w-[86px] h-[113px] rounded bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden shadow-lg"
                src={activeGame.image}
              />

              <div className="mt-3 w-full h-1 bg-gray-700 rounded overflow-hidden">
                <div className="w-2/3 h-full bg-white"></div>
              </div>
            </div>

            <div className="flex-grow max-w-[719px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-semibold text-white tracking-widest">
                  {activeGame.title}
                  </p>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-widest  text-gray-400 bg-[#FFFFFF0F] border border-gray-700 rounded flex items-center">
                    <span className="text-orange-500 mr-1 ">✦</span> ORBEiT
                    Originals
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <img src="/images/winners.svg" />
                  <div
                    className="flex"
                    style={{
                      borderBottom: "1px solid",
                      borderImage:
                        "repeating-linear-gradient(to right, #828282 0 3px, transparent 3px 6px) 1",
                    }}
                  >
                    <span className="text-white">{activeGame.winners}</span>
                  </div>

                  <span className="tracking-wider">~Winners</span>
                </div>
              </div>

              <p className="text-sm leading-snug tracking-widest text-gray-400 mb-6 max-w-3xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad  exercitation ullamco laboris
                nisi ut aliquip ex ea commodo conseq...
                <span className="text-orange-500 cursor-pointer border-b border-orange-500/30 hover:border-orange-500">
                  see more
                </span>
              </p>

              <div className="flex items-center space-x-6">
                <button className="py-[5px] text-center text-xs px-3 w-[123px] tracking-wider text-nowrap h-[24px] bg-[#ff4d00] text-white rounded hover:bg-orange-600 transition shadow-lg shadow-orange-900/20">
                  Complete Challenge
                </button>
                <div className="flex items-center space-x-2">
                  <img src="/images/gift.svg" />
                  <span className="text-sm tracking-widest text-gray-200">
                  {activeGame.reward}
                  </span>
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
