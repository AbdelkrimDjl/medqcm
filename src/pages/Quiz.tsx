import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
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

interface Question {
  id: number;
  text: string;
  module: string;
  difficulty: "easy" | "medium" | "hard";
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
  year: string;
  questionCount: number;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which artery supplies oxygenated blood to the heart muscle?",
    module: "Cardiology",
    difficulty: "medium",
    options: [
      { id: 1, text: "Coronary artery" },
      { id: 2, text: "Carotid artery" },
      { id: 3, text: "Pulmonary artery" },
      { id: 4, text: "Aorta" },
    ],
    correctOptionId: 1,
    explanation:
      "The coronary arteries supply oxygenated blood to the heart muscle (myocardium). They branch off from the aorta just above the aortic valve.",
  },
  {
    id: 2,
    text: "What is the most common cause of heart failure?",
    module: "Cardiology",
    difficulty: "medium",
    options: [
      { id: 5, text: "Coronary artery disease" },
      { id: 6, text: "Hypertension" },
      { id: 7, text: "Valvular disease" },
      { id: 8, text: "Cardiomyopathy" },
    ],
    correctOptionId: 5,
    explanation:
      "Coronary artery disease is the leading cause of heart failure, followed by hypertension. It reduces blood flow to the heart muscle.",
  },
  {
    id: 3,
    text: "Which neurotransmitter is primarily affected in Parkinson's disease?",
    module: "Neurology",
    difficulty: "medium",
    options: [
      { id: 9, text: "Serotonin" },
      { id: 10, text: "Dopamine" },
      { id: 11, text: "Acetylcholine" },
      { id: 12, text: "GABA" },
    ],
    correctOptionId: 10,
    explanation:
      "Parkinson's disease is characterized by the degeneration of dopamine-producing neurons in the substantia nigra, leading to motor symptoms.",
  },
  {
    id: 4,
    text: "What is the Glasgow Coma Scale maximum score?",
    module: "Neurology",
    difficulty: "easy",
    options: [
      { id: 13, text: "10" },
      { id: 14, text: "12" },
      { id: 15, text: "15" },
      { id: 16, text: "20" },
    ],
    correctOptionId: 15,
    explanation:
      "The Glasgow Coma Scale has a maximum score of 15, indicating full consciousness (Eye opening: 4, Verbal response: 5, Motor response: 6).",
  },
  {
    id: 5,
    text: "What is the normal ejection fraction of the left ventricle?",
    module: "Cardiology",
    difficulty: "medium",
    options: [
      { id: 17, text: "30-40%" },
      { id: 18, text: "50-70%" },
      { id: 19, text: "75-85%" },
      { id: 20, text: "85-95%" },
    ],
    correctOptionId: 18,
    explanation:
      "The normal left ventricular ejection fraction is 50-70%. Values below 40% indicate systolic dysfunction.",
  },
  {
    id: 6,
    text: "Which type of stroke is most common?",
    module: "Neurology",
    difficulty: "easy",
    options: [
      { id: 21, text: "Ischemic stroke" },
      { id: 22, text: "Hemorrhagic stroke" },
      { id: 23, text: "Embolic stroke" },
      { id: 24, text: "Lacunar stroke" },
    ],
    correctOptionId: 21,
    explanation:
      "Ischemic strokes account for approximately 87% of all strokes, caused by blockage of blood flow to the brain.",
  },
  {
    id: 7,
    text: "What does the P wave represent on an ECG?",
    module: "Cardiology",
    difficulty: "easy",
    options: [
      { id: 25, text: "Atrial depolarization" },
      { id: 26, text: "Ventricular depolarization" },
      { id: 27, text: "Atrial repolarization" },
      { id: 28, text: "Ventricular repolarization" },
    ],
    correctOptionId: 25,
    explanation:
      "The P wave represents atrial depolarization, which occurs when the atria contract to push blood into the ventricles.",
  },
  {
    id: 8,
    text: "Which cranial nerve is responsible for vision?",
    module: "Neurology",
    difficulty: "easy",
    options: [
      { id: 29, text: "Cranial nerve I" },
      { id: 30, text: "Cranial nerve II" },
      { id: 31, text: "Cranial nerve III" },
      { id: 32, text: "Cranial nerve IV" },
    ],
    correctOptionId: 30,
    explanation:
      "Cranial nerve II (optic nerve) is responsible for vision. It transmits visual information from the retina to the brain.",
  },
  {
    id: 9,
    text: "What is the first-line treatment for stable angina?",
    module: "Cardiology",
    difficulty: "medium",
    options: [
      { id: 33, text: "Beta-blockers" },
      { id: 34, text: "Calcium channel blockers" },
      { id: 35, text: "Nitrates" },
      { id: 36, text: "ACE inhibitors" },
    ],
    correctOptionId: 33,
    explanation:
      "Beta-blockers are the first-line treatment for stable angina as they reduce heart rate and myocardial oxygen demand.",
  },
  {
    id: 10,
    text: "What is the hallmark sign of meningitis on physical examination?",
    module: "Neurology",
    difficulty: "medium",
    options: [
      { id: 37, text: "Kernig's sign" },
      { id: 38, text: "Babinski sign" },
      { id: 39, text: "Romberg sign" },
      { id: 40, text: "Trendelenburg sign" },
    ],
    correctOptionId: 37,
    explanation:
      "Kernig's sign (along with Brudzinski's sign) is a classic finding in meningitis, indicating meningeal irritation.",
  },
];

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state as QuizConfig;

  const [quizMode] = useState<"test" | "practice">("test");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(3600);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!config) {
      navigate("/");
      return;
    }

    const filtered = MOCK_QUESTIONS.filter(
      (q) => q.module === config.module,
    ).slice(0, config.questionCount);
    setFilteredQuestions(filtered);
  }, [config, navigate]);

  const currentQuestion: Question = filteredQuestions[currentQuestionIndex];
  const totalQuestions: number = filteredQuestions.length;
  const answeredCount: number = Object.keys(answers).length;
  const progress: number =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (quizMode === "test" && !showResults && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizMode, showResults, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionId: number): void => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });

    if (quizMode === "practice") {
      setShowExplanation(true);
    }
  };

  const handleFlag = (): void => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleNext = (): void => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = (): void => {
    setShowResults(true);
  };

  const calculateScore = (): {
    correct: number;
    total: number;
    percentage: number;
  } => {
    let correct = 0;
    filteredQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) {
        correct++;
      }
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
      if (!moduleStats[q.module]) {
        moduleStats[q.module] = { total: 0, correct: 0 };
      }
      moduleStats[q.module].total++;
      if (answers[q.id] === q.correctOptionId) {
        moduleStats[q.module].correct++;
      }
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
                  <span className="font-semibold">Year:</span> {config.year}
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
                  setTimeRemaining(3600);
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
              <h1 className="text-2xl font-bold text-gray-800">ExamGen Quiz</h1>
              <p className="text-sm text-gray-600">
                {config.module} - {config.year}
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
              <div className="text-right">
                <div className="text-sm text-gray-600">Mode</div>
                <div className="font-semibold text-gray-800 capitalize">
                  {quizMode}
                </div>
              </div>
              {quizMode === "test" && (
                <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
                  <Clock
                    className={`w-5 h-5 ${timeRemaining < 300 ? "text-red-600" : "text-purple-600"}`}
                  />
                  <span
                    className={`font-mono font-semibold ${timeRemaining < 300 ? "text-red-600" : "text-purple-600"}`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
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
              <div
                className={`text-sm px-3 py-1 rounded-full ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : currentQuestion.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {currentQuestion.difficulty}
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
              const showCorrectAnswer =
                showExplanation && quizMode === "practice";

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
                  disabled={showExplanation && quizMode === "practice"}
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

          {showExplanation && quizMode === "practice" && (
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

            {currentQuestionIndex === totalQuestions - 1 ? (
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Quiz;
