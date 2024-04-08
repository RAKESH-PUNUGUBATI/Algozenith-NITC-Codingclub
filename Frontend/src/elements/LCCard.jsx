import React from "react";
import ReactCardFlip from "react-card-flip";
import lcdark from ".././components/Pics/lcdark.png";
import lclight from ".././components/Pics/lclight.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";

function LCCard({
  index,
  data,
  flippedIndex,
  setFlippedIndex,
  hoveredIndex,
  setHoveredIndex,
}) {
  return (
    <ReactCardFlip
      key={index}
      flipDirection="vertical"
      isFlipped={index === flippedIndex}
      className="card"
    >
      <div
        key="front"
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => setFlippedIndex(index === flippedIndex ? null : index)}
        className="h-40 mx-2 shadow-lg cursor-pointer rounded-2xl flex justify-between bg-gradient-to-r from-[#95ACC5] via-[#90a6bf] via-[#8096AE] via-[#7489a0] to-[#64778C]"
      >
        <div className="flex flex-col items-center ml-2 mt-4">
          <h1
            className={`font-bold ${
              hoveredIndex === index ? "text-[#EBA340]" : "text-white"
            } text-8xl`}
          >
            {data.date.substring(4, 6)}
          </h1>
          <h1
            className={`${
              hoveredIndex === index ? "text-[#EBA340]" : "text-white"
            } text-sm font-bold`}
          >
            {data.date.substring(0, 3).toUpperCase()}
          </h1>
        </div>
        <div>
          <img
            src={hoveredIndex === index ? lclight : lcdark}
            className="h-40 ml-6 mr-2"
          />
        </div>
      </div>
      <div
        key="back"
        onMouseLeave={() => {
          setHoveredIndex(null);
          setFlippedIndex(index === flippedIndex ? null : index);
        }}
        className="h-40 shadow-lg rounded-2xl flex justify-between bg-gradient-to-r from-[#95ACC5] via-[#90a6bf] via-[#8096AE] via-[#7489a0] to-[#64778C]"
      >
        <div className="p-2 text-sm font-semibold flex flex-col space-y-2 text-white">
          <a className="flex" href={data.question}>
            Question:
            {
              <div className="ml-1 flex">
                <h1>{data.quesname}</h1>
                <FontAwesomeIcon
                  icon={faSquareArrowUpRight}
                  className="mt-1.5 ml-1"
                />
              </div>
            }
          </a>
          <h1>Concepts: {data.concept}</h1>
          <h1>Companies: {data.companies}</h1>
          <p>
            Difficulty level:
            {data.level === "Easy" || data.level === "easy" ? (
              <span className="bg-green-500 text-white ml-2 text-xs px-2 pb-0.5 rounded-xl">
                Easy
              </span>
            ) : data.level === "Medium" || data.level === "medium" ? (
              <span className="bg-[#f6cd52] text-white ml-2 text-xs px-2 pb-0.5 rounded-xl">
                Medium
              </span>
            ) : (
              <span className="bg-red-500 text-white ml-2 text-xs px-2 pb-0.5 rounded-xl">
                Hard
              </span>
            )}
          </p>
          <a href={data.solution}>
            Solution: Click Here
            {
              <FontAwesomeIcon
                icon={faSquareArrowUpRight}
                className="mt-0 ml-1"
              />
            }
          </a>
        </div>
      </div>
    </ReactCardFlip>
  );
}

export default LCCard;
