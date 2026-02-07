import React, { useEffect, useState } from 'react';
import { QuizData } from '../data/QuizData';

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(score + 1);
        }
        if (currentQuestion < QuizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Quiz finished
            console.log(`Your score: ${score + (isCorrect ? 1 : 0)} out of ${QuizData.length}`);
        }
    };

    return (
        <div>
            <h1>Quiz</h1>
            <div>{QuizData[currentQuestion].question}</div>
            {QuizData[currentQuestion].answers.map((answer, index) => (
                <button key={index} onClick={() => handleAnswer(answer.isCorrect)}>{answer.text}</button>
            ))}
            <div>Your score: {score}</div>
        </div>
    );
};

export default Quiz;