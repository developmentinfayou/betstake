import React, { useEffect, useRef, useState } from "react";

export default function TrendingText() {
  const letters = ["T", "R", "E", "N", "D", "I", "N", "G"];
  const hasFilledRef = useRef(false);

  const [letterIndex, setLetterIndex] = useState(0); // kaunsa letter chal raha
  const [beamIndex, setBeamIndex] = useState(0); // us letter ka position
  const [filledCount, setFilledCount] = useState(0); // kitne letters fill ho chuke

  const positionsT = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsR = [
    { top: "56%", left: "78.8px", width: "1px", height: "25px", transform: "rotate3d(1, 1, 1, 335deg)" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsE = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsN = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsD = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsI = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsN2 = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
  ];

  const positionsG = [
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
    { top: "39%", left: "25.25px", width: "11.5px", height: "1px" },
    { top: "30%", left: "36.25px", width: "1px", height: "11px" },
    { top: "29.5%", left: "1.25px", width: "36px", height: "1px" },
    { top: "30%", left: "1.25px", width: "1px", height: "11px" },
    { top: "39%", left: "12.25px", width: "1px", height: "45px" },
    { top: "76%", left: "12.25px", width: "13.5px", height: "1px" },
    { top: "40%", left: "25.25px", width: "1px", height: "44px" },
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

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     const currentPositions = positionsMap[letterIndex];

  //     setBeamIndex((prev) => {
  //       // beam move
  //       if (prev < currentPositions.length - 1) {
  //         hasFilledRef.current = false; // reset guard while animating
  //         return prev + 1;
  //       }

  //       // 🛑 STRICT MODE GUARD
  //       if (hasFilledRef.current) return 0;
  //       hasFilledRef.current = true;

  //       // ✅ EXACTLY ONE FILL
  //       setFilledCount((f) => f + 1);

  //       if (letterIndex < letters.length - 1) {
  //         setLetterIndex((l) => l + 1);
  //       } else {
  //         // last letter (G)
  //         setTimeout(() => {
  //           setFilledCount(0);
  //           setLetterIndex(0);
  //         }, 400);
  //       }

  //       return 0;
  //     });
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, [letterIndex]);

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
        />
      </div>
    </div>
  );
}
