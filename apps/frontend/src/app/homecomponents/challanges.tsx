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
            <div className="absolute top-[45px] left-1/2 -translate-x-1/2 w-[200vw] blureddimage flex items-center justify-center gap-8 overflow-hidden">
              {[...games, ...games].map((game, index) => (
                <img
                  key={`${game.id}-${index}`}
                  src={game.image}
                  alt={game.title}
                  className={`w-[112px] h-[148px] rounded transition-all duration-500
              ${index % games.length === activeIndex
                      ? "blur-md scale-95 opacity-30"
                      : "blur-md scale-95 opacity-30"}
            `}
                />
              ))}
            </div>

            <div className="flex space-x-2 relative -left-[14px] items-center">
              <button onClick={prevSlide} className=" py-1 px-2 w-[22px] h-[22px] bg-[#1a1c2e] text-white rounded hover:bg-white/50 transition flex items-center justify-center">
                <svg
                  width="5"
                  height="8"
                  viewBox="0 0 5 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 7L1 4L4 1"
                    stroke="#FEFEFE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button onClick={nextSlide} className="py-1 px-2 w-[22px] h-[22px] bg-[#FEFEFE] text-[#1a1c2e] hover:bg-white/50  rounded transition flex items-center justify-center">
                <svg
                  width="5"
                  height="8"
                  viewBox="0 0 5 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 7L4 4L1 1"
                    stroke="#1a1c2e"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-8 items-center relative left-[45px]">
              <span className="text-[14px] tracking-wider text-gray-500">
                Challenges
              </span>
              <span className="text-[14px] tracking-wider  text-[#FF9169]  underline border-orange-500 cursor-pointer">
                View All
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex relative flex-col md:flex-row gap-[40px] items-start">
            <div className="relative flex-shrink-0">
              <img
                className="w-[100px] h-[132px] rounded bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden shadow-lg"
                src={activeGame.image}
              />

              <div className="mt-4 w-full h-1 bg-gray-700 rounded overflow-hidden">
                <div className="w-1/2 h-full bg-white"></div>
              </div>
            </div>

            <div className="flex-grow flex-1 w-full pt-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <p className="text-[16px] font-semibold text-white tracking-widest uppercase">
                    {activeGame.title}
                  </p>
                  <span className="px-2 py-1 text-[12px] font-semibold tracking-widest text-[#828282] bg-[#FFFFFF0F] border border-[#31313F] rounded flex items-center">
                    <span className="text-orange-500 mr-2 ">+</span> ORBEIT ORIGINALS
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[14px] text-gray-500">
                  <img src="/images/winners.svg" className="w-[14px] h-[14px]" />
                  <div
                    className="flex pb-[1px]"
                    style={{
                      borderBottom: "1px solid",
                      borderImage:
                        "repeating-linear-gradient(to right, #828282 0 3px, transparent 3px 6px) 1",
                    }}
                  >
                    <span className="text-white font-medium">{activeGame.winners}</span>
                  </div>

                  <span className="tracking-wider text-[#5B5B5B] shadow-sm shadow-gray-900/10">~Winners</span>
                </div>
              </div>

              <p className="text-[16px] leading-[22px] tracking-widest text-gray-400 mb-8 max-w-[840px] font-light">
                {activeGame.description.length > 200
                  ? activeGame.description.substring(0, 200) + "..."
                  : activeGame.description}
                <span className="text-[#FF7643] cursor-pointer underline ml-2 decoration-[#FF764355] hover:decoration-[#FF7643]">
                  see more
                </span>
              </p>

              <div className="flex items-center space-x-10">
                <button className="py-2 text-center text-[14px] px-6 min-w-[155px] tracking-widest uppercase font-medium h-[36px] bg-[#FF4500] text-white rounded-[2px] hover:bg-orange-600 transition shadow-lg shadow-orange-950/20">
                  Complete Challenge
                </button>
                <div className="flex items-center space-x-3">
                  <img src="/images/gift.svg" className="w-[18px] h-[18px]" />
                  <span className="text-[16px] tracking-[0.1em] font-medium text-gray-200">
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
