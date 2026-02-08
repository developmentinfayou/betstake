import React, { useEffect, useRef, useState } from "react";

export default function TrendingText() {
  const letters = ["T", "R", "E", "N", "D", "I", "N", "G"];
  const hasFilledRef = useRef(false);

  const [letterIndex, setLetterIndex] = useState(0); // kaunsa letter chal raha
  const [beamIndex, setBeamIndex] = useState(0); // us letter ka position
  const [filledCount, setFilledCount] = useState(0); // kitne letters fill ho chuke

  const positionsT = [
    { top: "63%", left: "25.25px", width: "1px", height: "16px" },
    { top: "52%", left: "25.25px", width: "1px", height: "16px" },
    { top: "40%", left: "25.25px", width: "1px", height: "16px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "21.3px", width: "16px", height: "1px" },
    { top: "29.5%", left: "11.3px", width: "16px", height: "1px" },
    { top: "29.5%", left: "1.8px", width: "16px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "2.25px", width: "10px", height: "1px" },
    { top: "39.5%", left: "12.25px", width: "1px", height: "16px" },
    { top: "51%", left: "12.25px", width: "1px", height: "16px" },
    { top: "63%", left: "12.25px", width: "1px", height: "16px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "63%", left: "25.25px", width: "1px", height: "16px" },

  ];

  const positionsR = [
    { top: "63%", left: "79.8px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  { top: "56%", left: "77.8px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  { top: "56%", left: "75.8px", width: "1px", height: "3px",  transform: "rotate3d(1, 1, 1, 335deg)" },
  { top: "54%", left: "76px",   width: "4px", height: "1px",  transform: "rotate3d(1, 1, 2, 305deg)" },
  { top: "53%", left: "77.5px", width: "4px", height: "1px",  transform: "rotate3d(1, 1, 2, 293deg)" },
  { top: "49%", left: "81px", width: "1px", height: "1px" },
  { top: "45%", left: "82px", width: "1px", height: "1px" },
  { top: "39%", left: "81px", width: "1px", height: "1px" },
  { top: "34%", left: "78px", width: "1px", height: "1px" },
  { top: "30%", left: "70px", width: "1px", height: "1px" },
  { top: "29.4%", left: "68px", width: "1px", height: "1px" },
  { top: "29.4%", left: "53px", width: "16px", height: "1px" },
  { top: "29.4%", left: "49px", width: "5px", height: "1px" },
  { top: "30.4%", left: "48px", width: "1px", height: "16px" },
  { top: "42%", left: "48px", width: "1px", height: "16px" },
  { top: "56%", left: "48px", width: "1px", height: "16px" },
  { top: "63%", left: "48px", width: "1px", height: "16px" },
  { top: "76.2%", left: "48px", width: "14px", height: "1px" },
  { top: "63%", left: "61.3px", width: "1px", height: "16px" },
  { top: "58%", left: "61.3px", width: "1px", height: "16px" },
  { top: "58%", left: "61px", width: "3px", height: "1px" },
  { top: "58%", left: "65.6px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 338deg)" },
  { top: "63.6%", left: "67.1px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 337deg)" },
  { top: "76.4%", left: "69.1px", width: "14px", height: "1px" },
  { top: "63%", left: "79.8px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },

  ];

  const positionsE = [
    { top: "68%", left: "124.25px", width: "1px", height: "10px" },
    { top: "66.8%", left: "108px", width: "16px", height: "1px" },
    { top: "57.8%", left: "107px", width: "1px", height: "11px" },
    { top: "57.4%", left: "107px", width: "10px", height: "1px" },
    { top: "48.6%", left: "117px", width: "1px", height: "11px" },
    { top: "48%", left: "107px", width: "10px", height: "1px" },
    { top: "39%", left: "107px", width: "1px", height: "11px" },
    { top: "39%", left: "107px", width: "17px", height: "1px" },
    { top: "30%", left: "124px", width: "1px", height: "11px" },
    { top: "29.5%", left: "109px", width: "16px", height: "1px" },
    { top: "29.5%", left: "95px", width: "16px", height: "1px" },
    { top: "30%", left: "93.5px", width: "1px", height: "16px" },
    { top: "44%", left: "93.5px", width: "1px", height: "16px" },
    { top: "58%", left: "93.5px", width: "1px", height: "16px" },
    { top: "69%", left: "93.5px", width: "1px", height: "9px" },
    { top: "76.2%", left: "94.5px", width: "16px", height: "1px" },
    { top: "76.2%", left: "108.5px", width: "16px", height: "1px" },
    { top: "68%", left: "124.25px", width: "1px", height: "10px" },

  ];

  const positionsN = [
    { top: "63%", left: "172px", width: "1px", height: "16px" },
    { top: "52%", left: "172px", width: "1px", height: "16px" },
    { top: "38%", left: "172px", width: "1px", height: "16px" },
    { top: "30%", left: "172px", width: "1px", height: "16px" },
  
    { top: "29.5%", left: "159.6px", width: "12.7px", height: "1px" },
    { top: "29.5%", left: "159px", width: "1px", height: "16px" },
    { top: "40.5%", left: "159px", width: "1px", height: "16px" },
  
    { top: "40.5%", left: "156px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "29.5%", left: "152.3px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  
    { top: "29.5%", left: "136.3px", width: "14px", height: "1px" },
    { top: "29.5%", left: "136px", width: "1px", height: "16px" },
    { top: "41.5%", left: "136px", width: "1px", height: "16px" },
    { top: "55.5%", left: "136px", width: "1px", height: "16px" },
    { top: "66.5%", left: "136px", width: "1px", height: "12px" },
    { top: "76.2%", left: "136.3px", width: "13px", height: "1px" },
  
    { top: "63.2%", left: "149px", width: "1px", height: "16px" },
    { top: "53%", left: "149px", width: "1px", height: "16px" },
  
    { top: "52%", left: "151px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "64%", left: "156px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  
    { top: "76.2%", left: "158px", width: "15px", height: "1px" },
    { top: "63%", left: "172px", width: "1px", height: "16px" },

  ];

  const positionsD = [
    { top: "76.2%", left: "185px", width: "15px", height: "1px" },
    { top: "76.2%", left: "198px", width: "5px", height: "1px" },
    { top: "74.3%", left: "210px", width: "2px", height: "1px", transform: "rotate(-29deg)" },
    { top: "70.3%", left: "215px", width: "2px", height: "1px", transform: "rotate(-60deg)" },
    { top: "66.3%", left: "216.7px", width: "2px", height: "1px", transform: "rotate(-81deg)" },
  
    { top: "51.3%", left: "217.7px", width: "1px", height: "16px" },
    { top: "40.3%", left: "217.7px", width: "1px", height: "16px" },
  
    { top: "36.3%", left: "216.7px", width: "1px", height: "3px", transform: "rotate(-24deg)" },
    { top: "32.3%", left: "212.7px", width: "1px", height: "3px", transform: "rotate(-45deg)" },
    { top: "29.3%", left: "206.7px", width: "1px", height: "3px", transform: "rotate(-73deg)" },
    { top: "28.9%", left: "203.7px", width: "1px", height: "3px", transform: "rotate(-84deg)" },
  
    { top: "29.5%", left: "185.7px", width: "16px", height: "1px" },
    { top: "29.5%", left: "184.7px", width: "1px", height: "16px" },
    { top: "40.5%", left: "184.7px", width: "1px", height: "16px" },
    { top: "54.5%", left: "184.7px", width: "1px", height: "16px" },
    { top: "63.5%", left: "184.7px", width: "1px", height: "16px" },
    { top: "76.2%", left: "185px", width: "15px", height: "1px" },

  ];

  const positionsI = [
    { top: "76%", left: "230px", width: "14px", height: "1px" },
  { top: "63%", left: "243.3px", width: "1px", height: "16px" },
  { top: "50%", left: "243.3px", width: "1px", height: "16px" },
  { top: "37%", left: "243.3px", width: "1px", height: "16px" },
  { top: "30%", left: "243.3px", width: "1px", height: "10px" },
  { top: "29.5%", left: "231.3px", width: "12px", height: "1px" },
  { top: "30%", left: "230px", width: "1px", height: "16px" },
  { top: "44%", left: "230px", width: "1px", height: "16px" },
  { top: "57%", left: "230px", width: "1px", height: "16px" },
  { top: "63%", left: "230px", width: "1px", height: "16px" },
  { top: "76%", left: "230px", width: "14px", height: "1px" },

   
  ];

  const positionsN2 = [
    { top: "63%", left: "292px", width: "1px", height: "16px" },
    { top: "52%", left: "292px", width: "1px", height: "16px" },
    { top: "38%", left: "292px", width: "1px", height: "16px" },
    { top: "30%", left: "292px", width: "1px", height: "16px" },
  
    { top: "29.5%", left: "280px", width: "12.7px", height: "1px" },
    { top: "29.5%", left: "279px", width: "1px", height: "16px" },
    { top: "40.5%", left: "279px", width: "1px", height: "16px" },
  
    { top: "40.5%", left: "276px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "29.5%", left: "272.3px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  
    { top: "29.5%", left: "256.3px", width: "14px", height: "1px" },
    { top: "29.5%", left: "256px", width: "1px", height: "16px" },
    { top: "41.5%", left: "256px", width: "1px", height: "16px" },
    { top: "55.5%", left: "256px", width: "1px", height: "16px" },
    { top: "66.5%", left: "256px", width: "1px", height: "12px" },
    { top: "76.2%", left: "256.3px", width: "13px", height: "1px" },
  
    { top: "63.2%", left: "269px", width: "1px", height: "16px" },
    { top: "53%", left: "269px", width: "1px", height: "16px" },
  
    { top: "52%", left: "271px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "64%", left: "276px", width: "1px", height: "16px", transform: "rotate3d(1, 1, 1, 335deg)" },
  
    { top: "76.2%", left: "278px", width: "14.6px", height: "1px" },
    { top: "63%", left: "292px", width: "1px", height: "16px" },

  ];

  const positionsG = [
    { top: "51%", left: "337.5px", width: "1px", height: "16px" },
    { top: "60%", left: "337.5px", width: "1px", height: "7px" },
    { top: "71%", left: "334.5px", width: "1px", height: "3px", transform: "rotate3d(1, 1, 1, 65deg)" },
    { top: "75%", left: "329.5px", width: "3px", height: "1px", transform: "rotate3d(1, 1, 1, 301deg)" },
    { top: "76.8%", left: "318.5px", width: "3px", height: "1px" },
    { top: "73.3%", left: "308.5px", width: "3px", height: "1.5px", transform: "rotate3d(1, 1, 1, 52deg)" },
    { top: "67.3%", left: "304.5px", width: "1px", height: "1.5px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "52.3%", left: "304px", width: "1px", height: "16px" },
    { top: "40.3%", left: "304px", width: "1px", height: "16px" },
    { top: "34.3%", left: "305.5px", width: "1px", height: "7px", transform: "rotate3d(1, 1, 1, 51deg)" },
    { top: "28.3%", left: "312.5px", width: "3px", height: "6px", transform: "rotate3d(1, 1, 1, 198deg)" },
    { top: "26.3%", left: "322.5px", width: "5px", height: "9px", transform: "rotate3d(1, 1, 1, 253deg)" },
    { top: "32.3%", left: "332.5px", width: "1px", height: "1px" },
    { top: "38.3%", left: "337px", width: "1px", height: "1px" },
    { top: "40.3%", left: "337.5px", width: "1px", height: "7px" },
    { top: "45.3%", left: "324.5px", width: "14px", height: "1px" },
    { top: "41.3%", left: "324.5px", width: "1px", height: "5px" },
    { top: "38.6%", left: "321.5px", width: "1px", height: "1px" },
    { top: "40.6%", left: "317.5px", width: "1px", height: "1px" },
    { top: "40.6%", left: "317.5px", width: "1px", height: "16px" },
    { top: "51.6%", left: "317.5px", width: "1px", height: "16px" },
    { top: "64.6%", left: "317.5px", width: "1px", height: "1px" },
    { top: "67%", left: "320.5px", width: "1px", height: "1px" },
    { top: "66%", left: "323.5px", width: "1px", height: "1px" },
    { top: "60%", left: "324.5px", width: "1px", height: "6px" },
    { top: "59%", left: "321px", width: "4px", height: "1px" },
    { top: "51%", left: "321px", width: "1px", height: "10px" },
    { top: "50.5%", left: "321px", width: "17px", height: "1px" },
    { top: "51%", left: "337.5px", width: "1px", height: "16px" },

  ];

  const positionsMap = [
    positionsT,
    positionsR,
    positionsE,
    positionsN,
    positionsD,
    positionsI,
    positionsN2,
    positionsG,
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentPositions = positionsMap[letterIndex];

      setBeamIndex((prev) => {
        // beam move
        if (prev < currentPositions.length - 1) {
          hasFilledRef.current = false; // reset guard while animating
          return prev + 1;
        }

        // 🛑 STRICT MODE GUARD
        if (hasFilledRef.current) return 0;
        hasFilledRef.current = true;

        // ✅ EXACTLY ONE FILL
        setFilledCount((f) => f + 1);

        if (letterIndex < letters.length - 1) {
          setLetterIndex((l) => l + 1);
        } else {
          // last letter (G)
          setTimeout(() => {
            setFilledCount(0);
            setLetterIndex(0);
          }, 400);
        }

        return 0;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [letterIndex]);

  useEffect(() => {
    console.log({ letterIndex, filledCount, beamIndex });
  }, [letterIndex, filledCount, beamIndex]);

  return (
    <div className="">
      <div
        style={{
          letterSpacing: "7px",
          WebkitTextStroke: "1px #31313F",
          fontWeight: 900,
        }}
        className="relative text-[5rem]"
      >
        {letters?.map((char, i) => (
          <span
            key={i}
            style={{
              color: i < filledCount ? "#FFFFFF0F" : "transparent",
            }}
          >
            {char}
          </span>
        ))}

        <span
          className="beam-dot absolute"
          style={positionsMap[letterIndex][beamIndex]}
          // style={positionsMap[7][0]}
        />
      </div>
    </div>
  );
}
