import { useEffect, useState } from "react";

export default function TrendingText() {
  const positions = [
    { top: "50%", left: "5%", width: "3px", height: "1rem" },
    { top: "38%", left: "5%", width: "3px", height: "1rem" },
    { top: "37%", left: "5%", width: "11px", height: "2px" },
    { top: "29%", left: "8%", width: "2px", height: "9px" },
    { top: "29%", left: "4%", width: "12px", height: "2px" },
    { top: "29%", left: "1%", width: "12px", height: "2px" },
    { top: "29%", left: "0%", width: "3px", height: "9px" },
    { top: "36%", left: "0%", width: "3px", height: "3px" },
    { top: "36%", left: "0%", width: "11px", height: "3px" },
    { top: "36%", left: "2.5%", width: "3px", height: "3px" },
    { top: "40%", left: "2.5%", width: "3px", height: "3px" },
    { top: "46%", left: "2.5%", width: "3px", height: "3px" },
    { top: "50%", left: "2.5%", width: "3px", height: "3px" },
    { top: "54%", left: "2.5%", width: "3px", height: "3px" },
    { top: "58%", left: "2.5%", width: "3px", height: "3px" },
    { top: "62%", left: "2.5%", width: "3px", height: "3px" },
    { top: "63%", left: "2.5%", width: "3px", height: "3px" },
    { top: "64%", left: "2.5%", width: "3px", height: "3px" },
    { top: "65%", left: "2.5%", width: "3px", height: "3px" },
    { top: "66%", left: "2.5%", width: "3px", height: "3px" },
    { top: "67%", left: "2.5%", width: "3px", height: "3px" },
    { top: "68%", left: "2.5%", width: "3px", height: "3px" },
    { top: "69%", left: "2.5%", width: "3px", height: "3px" },
    { top: "70%", left: "2.5%", width: "3px", height: "3px" },
    { top: "71%", left: "2.5%", width: "3px", height: "3px" },
    { top: "72%", left: "2.5%", width: "3px", height: "3px" },
    { top: "73%", left: "2.5%", width: "3px", height: "3px" },
    { top: "74%", left: "2.5%", width: "3px", height: "3px" },
    { top: "74%", left: "3%", width: "3px", height: "3px" },
    { top: "74%", left: "3.5%", width: "3px", height: "3px" },
    { top: "74%", left: "4%", width: "3px", height: "3px" },
    { top: "74%", left: "4.5%", width: "3px", height: "3px" },
    { top: "74%", left: "5%", width: "3px", height: "3px" },
    { top: "73%", left: "5%", width: "3px", height: "3px" },
    { top: "72%", left: "5%", width: "3px", height: "3px" },
    { top: "71%", left: "5%", width: "3px", height: "3px" },
    { top: "70%", left: "5%", width: "3px", height: "3px" },
    { top: "69%", left: "5%", width: "3px", height: "3px" },
    { top: "68%", left: "5%", width: "3px", height: "3px" },
    { top: "67%", left: "5%", width: "3px", height: "3px" },
    { top: "66%", left: "5%", width: "3px", height: "3px" },
    { top: "65%", left: "5%", width: "3px", height: "3px" },
    { top: "64%", left: "5%", width: "3px", height: "3px" },
    { top: "63%", left: "5%", width: "3px", height: "3px" },
    { top: "62%", left: "5%", width: "3px", height: "3px" },
    { top: "61%", left: "5%", width: "3px", height: "3px" },


   
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % positions.length);
    }, 100); // 0.1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      <div className="relative text-[4rem] font-bold tracking-widest text-transparent stroke-text">
        TRENDING
        <span
          className="beam-dot absolute"
          style={positions[index]}
        ></span>
      </div>
    </div>
  );
}
