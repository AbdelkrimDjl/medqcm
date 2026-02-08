// Quiz.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Home as HomeIcon,
  Calendar,
  ExternalLink,
  Maximize2,
  Minimize2,
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
  correctOptionIds: number[];
  explanation: string;
  date?: string; // Optional: Date key for document reference
  documentUrl?: string; // Optional: Direct URL to document
  attachedPhoto?: string; // Optional: URL or path to attached image
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
  questions: Question[];
}

const Quiz: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state as QuizConfig;
  const paginationRef = useRef<HTMLDivElement>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );

  const [showResults, setShowResults] = useState<boolean>(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<Set<number>>(new Set());
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!config || !config.questions || config.questions.length === 0) {
      navigate("/");
      return;
    }

    setFilteredQuestions(config.questions.slice(0, config.questionCount));
  }, [config, navigate]);

  // Auto-scroll pagination to show current question
  useEffect(() => {
    if (paginationRef.current) {
      const currentButton = paginationRef.current.children[currentQuestionIndex] as HTMLElement;
      if (currentButton) {
        currentButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentQuestionIndex]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Helper function to check if answer is correct
  const isAnswerCorrect = (questionId: number): boolean => {
    const question = filteredQuestions.find(q => q.id === questionId);
    if (!question) return false;
    
    const userAnswers = answers[questionId] || [];
    const correctAnswers = (question.correctOptionIds || []).map(Number);
    
    return arraysEqual(userAnswers, correctAnswers);
  };

  const handleSelectOption = (optionId: number): void => {
    if (!confirmedAnswers.has(currentQuestion.id)) {
      const currentSelections = answers[currentQuestion.id] || [];
      const optionIdNum = Number(optionId);
      
      let newSelections: number[];
      if (currentSelections.includes(optionIdNum)) {
        newSelections = currentSelections.filter(id => id !== optionIdNum);
      } else {
        newSelections = [...currentSelections, optionIdNum];
      }
      
      setAnswers({ ...answers, [currentQuestion.id]: newSelections });
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
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const arraysEqual = (arr1: number[], arr2: number[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].map(Number).sort((a, b) => a - b);
    const sorted2 = [...arr2].map(Number).sort((a, b) => a - b);
    return sorted1.every((val, idx) => val === sorted2[idx]);
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach((q) => {
      const userAnswers = answers[q.id] || [];
      const correctAnswers = (q.correctOptionIds || []).map(Number);
      
      if (arraysEqual(userAnswers, correctAnswers)) {
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
      if (!moduleStats[q.module])
        moduleStats[q.module] = { total: 0, correct: 0 };
      moduleStats[q.module].total++;
      
      const userAnswers = answers[q.id] || [];
      const correctAnswers = (q.correctOptionIds || []).map(Number);
      
      if (arraysEqual(userAnswers, correctAnswers)) {
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
          <p className="text-xl mb-4">Un moment...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const moduleBreakdown = getModuleBreakdown();

    return (
      <div
        className="min-h-screen p-4 sm:p-8"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mb-6 animate-fadeIn">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                Simulation Completée
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Voici votre performance</p>
              <div className="mt-4 space-y-1 text-xs sm:text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Module:</span> {config.module}
                </p>
                <p>
                  <span className="font-semibold">Unité:</span> {config.unit}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8">
              <div className="text-center">
                <div
                  className="text-5xl sm:text-7xl font-bold mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {Math.round(score.percentage)}%
                </div>
                <div className="text-xl sm:text-2xl text-gray-700 mb-4">
                  {score.correct} sur {score.total} correctes
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Performance par Module
              </h2>
              <div className="space-y-4">
                {moduleBreakdown.map((module, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">
                        {module.module}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-bold ${
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
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div
                        className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                          module.accuracy >= 70
                            ? "bg-green-500"
                            : module.accuracy >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${module.accuracy}%` }}
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      {module.correct} / {module.total} questions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 sm:py-4 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Retour à l'Accueil
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setFlaggedQuestions(new Set());
                  setConfirmedAnswers(new Set());
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 sm:py-4 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
              >
                Refaire la Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if current question is confirmed to show correct/incorrect highlighting
  const isCurrentConfirmed = confirmedAnswers.has(currentQuestion.id);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">QCM Blida</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {config.module} - {config.unit}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs sm:text-sm"
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>
                Progress: {answeredCount} / {totalQuestions}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8">
          {/* Question Header */}
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
              <div className="bg-purple-100 text-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm">
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {currentQuestion.module}
              </div>
              
              {/* Date/Document Reference Button */}
              {currentQuestion.date && (
                <a
                  href={getDocumentUrl(currentQuestion.Date)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full hover:bg-blue-200 transition-all"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{currentQuestion.date}</span>
                  <ExternalLink className="w-3 h-3 sm:w-3 sm:h-3" />
                </a>
              )}
            </div>
            
            <button
              onClick={handleFlag}
              className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${
                flaggedQuestions.has(currentQuestion.id)
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-400 hover:text-yellow-600"
              }`}
            >
              <Flag
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill={
                  flaggedQuestions.has(currentQuestion.id)
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>

          {/* Attached Photo */}
          {currentQuestion.attachedPhoto && (
            <div className="mb-6 sm:mb-8">
              <div className="relative group">
                <img
                  src={currentQuestion.attachedPhoto}
                  alt="Question attachment"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition-all"
                  onClick={() => setExpandedImage(currentQuestion.attachedPhoto!)}
                />
                <button
                  onClick={() => setExpandedImage(currentQuestion.attachedPhoto!)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Cliquez sur l'image pour l'agrandir
              </p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {currentQuestion.options.map((option) => {
              const userAnswers = answers[currentQuestion.id] || [];
              const isSelected = userAnswers.map(Number).includes(Number(option.id));
              const isCorrect = (currentQuestion.correctOptionIds || [])
                .map(Number)
                .includes(Number(option.id));
              const showCorrectAnswer = isCurrentConfirmed;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                    showCorrectAnswer && isCorrect
                      ? "border-green-500 bg-green-50"
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                  disabled={isCurrentConfirmed}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-lg text-gray-800 flex-1 whitespace-pre-wrap">
                      {formatTextWithNewlines(option.text)}
                    </span>
                    <div className="flex-shrink-0">
                      {showCorrectAnswer && isCorrect && (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      )}
                      {showCorrectAnswer && isSelected && !isCorrect && (
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      )}
                      {isSelected && !showCorrectAnswer && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isCurrentConfirmed && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mb-6 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Expliquation
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed whitespace-pre-wrap">
                {formatTextWithNewlines(currentQuestion.explanation)}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 mb-4 sm:mb-6 gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {!isCurrentConfirmed ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Confirmer</span>
                <span className="sm:hidden">Confirm</span>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Soumettre</span>
                <span className="sm:hidden">Submit</span>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Scrollable Pagination */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Navigateur des Questions
            </h4>
            <div className="relative">
              <div
                ref={paginationRef}
                className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d8b4fe #f3f4f6'
                }}
              >
                {filteredQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] && answers[q.id].length > 0;
                  const isConfirmed = confirmedAnswers.has(q.id);
                  const isCorrect = isAnswerCorrect(q.id);
                  const isCurrent = idx === currentQuestionIndex;
                  const isFlagged = flaggedQuestions.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                        isCurrent
                          ? "bg-purple-600 text-white ring-2 ring-purple-300"
                          : isConfirmed && isCorrect
                            ? "bg-green-500 text-white"
                            : isConfirmed && !isCorrect
                              ? "bg-red-500 text-white"
                              : isAnswered
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${isFlagged ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              {/* Scroll hint for mobile */}
              <div className="text-xs text-gray-500 text-center mt-2 sm:hidden">
                ← Glisser pour en voir plus →
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
            Stats Rapides
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {answeredCount}
              </div>
              <div className="text-xs sm:text-sm text-green-700">Résolues</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">
                {totalQuestions - answeredCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Restantes</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {flaggedQuestions.size}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700">Signalé</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-7xl max-h-screen">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style>{`
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

        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d8b4fe;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #c084fc;
        }
      `}</style>
    </div>
  );
};

export default Quiz;
