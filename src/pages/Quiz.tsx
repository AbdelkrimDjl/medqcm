// Quiz.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Home as HomeIcon,
} from "lucide-react";

interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  module: string;
  options: Option[];
  correctOptionId: number;
  explanation: string;
}

interface ModuleStat {
  module: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface QuizConfig {
  module: string;
  unit: string;
  questionCount: number;
  questions: Question[]; // pass questions from Home
}

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state as QuizConfig;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );

  const [showResults, setShowResults] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<Set<number>>(new Set());


  useEffect(() => {
    if (!config || !config.questions || config.questions.length === 0) {
      navigate("/");
      return;
    }

    setFilteredQuestions(config.questions.slice(0, config.questionCount));
  }, [config, navigate]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;


  const handleSelectOption = (optionId: number): void => {
    // Only allow selection if answer hasn't been confirmed yet
    if (!confirmedAnswers.has(currentQuestion.id)) {
      setAnswers({ ...answers, [currentQuestion.id]: optionId });
    }
  };

  const handleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id))
      newFlagged.delete(currentQuestion.id);
    else newFlagged.add(currentQuestion.id);
    setFlaggedQuestions(newFlagged);
  };

  const handleConfirmAnswer = (): void => {
    const newConfirmed = new Set(confirmedAnswers);
    newConfirmed.add(currentQuestion.id);
    setConfirmedAnswers(newConfirmed);
    setShowExplanation(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) correct++;
    });
    return {
      correct,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0,
    };
  };

  const getModuleBreakdown = (): ModuleStat[] => {
    const moduleStats: Record<string, { total: number; correct: number }> = {};
    filteredQuestions.forEach((q) => {
      if (!moduleStats[q.module])
        moduleStats[q.module] = { total: 0, correct: 0 };
      moduleStats[q.module].total++;
      if (answers[q.id] === q.correctOptionId) moduleStats[q.module].correct++;
    });
    return Object.entries(moduleStats).map(([module, stats]) => ({
      module,
      ...stats,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }));
  };

  if (!config || filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

    if (showResults) {
    const score = calculateScore();
    const moduleBreakdown = getModuleBreakdown();

    return (
      <div
        className="min-h-screen p-8"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Quiz Complete! 🎉
              </h1>
              <p className="text-gray-600">Here's how you performed</p>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Module:</span> {config.module}
                </p>
                <p>
                  <span className="font-semibold">Unité:</span> {config.unit}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div
                  className="text-7xl font-bold mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {Math.round(score.percentage)}%
                </div>
                <div className="text-2xl text-gray-700 mb-4">
                  {score.correct} out of {score.total} correct
                </div>
                <div
                  className={`inline-block px-6 py-2 rounded-full text-white text-lg font-semibold ${
                    score.percentage >= 70 ? "bg-green-500" : "bg-orange-500"
                  }`}
                >
                  {score.percentage >= 70 ? "✓ Pass" : "✗ Needs Improvement"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Performance by Module
              </h2>
              <div className="space-y-4">
                {moduleBreakdown.map((module, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">
                        {module.module}
                      </span>
                      <span
                        className={`font-bold ${
                          module.accuracy >= 70
                            ? "text-green-600"
                            : module.accuracy >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {Math.round(module.accuracy)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          module.accuracy >= 70
                            ? "bg-green-500"
                            : module.accuracy >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${module.accuracy}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {module.correct} / {module.total} questions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                Back to Home
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setFlaggedQuestions(new Set());
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-all"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">QCM Blida 2ème Année Médecine</h1>
              <p className="text-sm text-gray-600">
                {config.module} - {config.unit}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Progress: {answeredCount} / {totalQuestions}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {currentQuestion.module}
              </div>
            </div>
            <button
              onClick={handleFlag}
              className={`p-2 rounded-lg transition-all ${
                flaggedQuestions.has(currentQuestion.id)
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-400 hover:text-yellow-600"
              }`}
            >
              <Flag
                className="w-6 h-6"
                fill={
                  flaggedQuestions.has(currentQuestion.id)
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const isCorrect = option.id === currentQuestion.correctOptionId;
              const isConfirmed = confirmedAnswers.has(currentQuestion.id);
              const showCorrectAnswer = showExplanation && isConfirmed;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showCorrectAnswer && isCorrect
                      ? "border-green-500 bg-green-50"
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                  disabled={confirmedAnswers.has(currentQuestion.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-gray-800">{option.text}</span>
                    {showCorrectAnswer && isCorrect && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                    {showCorrectAnswer && isSelected && !isCorrect && (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                    {isSelected && !showCorrectAnswer && (
                      <div className="w-6 h-6 rounded-full bg-purple-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && confirmedAnswers.has(currentQuestion.id) && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6 animate-fadeIn">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Explanation
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {filteredQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setShowExplanation(false);
                  }}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    idx === currentQuestionIndex
                      ? "bg-purple-600 text-white"
                      : answers[q.id]
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } ${flaggedQuestions.has(q.id) ? "ring-2 ring-yellow-400" : ""}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {!confirmedAnswers.has(currentQuestion.id) ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={!answers[currentQuestion.id]}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Answer
                <Check className="w-5 h-5" />
              </button>
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Submit Quiz
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {answeredCount}
              </div>
              <div className="text-sm text-green-700">Answered</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {totalQuestions - answeredCount}
              </div>
              <div className="text-sm text-gray-700">Remaining</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {flaggedQuestions.size}
              </div>
              <div className="text-sm text-yellow-700">Flagged</div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Quiz;








