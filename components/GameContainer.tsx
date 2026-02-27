"use client";

import { useState, useEffect } from "react";
import { Question } from "@/types";
import { getLocalDateString } from "@/lib/date";
import { getTodayQuestion } from "@/lib/questions";
import Header from "./Header";
import GameBoard from "./GameBoard";

interface GameContainerProps {
  serverQuestion: Question;
}

export default function GameContainer({ serverQuestion }: GameContainerProps) {
  const [question, setQuestion] = useState(serverQuestion);

  useEffect(() => {
    const localDate = getLocalDateString();
    if (localDate !== serverQuestion.date) {
      setQuestion(getTodayQuestion(localDate));
    }
  }, [serverQuestion]);

  return (
    <>
      <Header
        questionNumber={question.questionNumber}
        category={question.category}
      />
      <div className="w-full max-w-game px-5">
        <GameBoard question={question} />
      </div>
    </>
  );
}
