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
  Date?: string;
  courseName?: string[];
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

  const getDateLink = (DateString: string | undefined): string => {
    if (!DateString) return "#";
    // 1. Define your specific links here
    const links: Record<string, string> = {
      // 2ème année Système Endocrinien
      "24 Février 2024": "https://drive.google.com/drive/folders/1abq3-rKIZ172vpCgtGWOvFmuWgCFssjR?usp=drive_link",
      "04 Mai 2025": "https://drive.google.com/file/d/13G53e4NjptfnHrUBNWwdXnrZSIJnEwML/view?usp=sharing",
      "15 Mars 2022": "https://drive.google.com/file/d/1I-o6xQBBJVP2jHu0-ozULY9A4YQET6Ya/view?usp=sharing",
      "05 Mars 2023": "https://drive.google.com/file/d/1HIgHKTGDyheUFbm-CYWtVJwoBPhH7lUY/view?usp=sharing",
      "16 Mai 2021": "https://drive.google.com/file/d/1Rx32-1cJYzfqz-DztL00cvoWuZ0p8XhY/view?usp=sharing",
      "13 Septembre 2022": "https://drive.google.com/file/d/14eUdxjGzrv81IlMVJxAWiIipbW_jmokc/view?usp=sharing",
      "07 Juillet 2024": "https://drive.google.com/drive/folders/1Muv10NYjgUGYL2wN2-oeqMuWCzdIipTO?usp=drive_link",
      "13 Septembre 2020": "https://drive.google.com/file/d/1XJzzqYKvlu7zxLBCY8Boz8-mQ0ClGGyz/view?usp=sharing",
      "20 Février 2020": "https://drive.google.com/drive/folders/1Zughhq9CGPoUq1va-xNeE9eoh5s-Gjpk?usp=sharing",
      // 2ème année Génétique
      "03 Juillet 2025": "https://drive.google.com/file/d/13Ds66l8MV5V6pLJY4BcdrJqKLylJuBeV/view?usp=sharing"
    };

    // 2. Return the specific link, or a fallback (e.g., a Google search) if not found
    return links[DateString] || "#";
  };


  const [showResults, setShowResults] = useState<boolean>(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!config || !config.questions || config.questions.length === 0) {
      navigate("/");
      return;
    }


    setFilteredQuestions(config.questions.slice(0, config.questionCount));

  }, [config, navigate]);

  // Auto-scroll pagination to show current question
  useEffect(() => {
    const topElement = document.getElementById('quiz-top');
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const askGoogleSearch = () => {
    if (!currentQuestion) return;
    // Formats options into "A. Text, B. Text..."
    const optionsString = currentQuestion.options
      .map((opt) => `${opt.text}`)
      .join(", ");

    // Combines everything for a high-quality medical search
    const fullQuery = `Agis en tant que professeur en ${currentQuestion.module}. Analyse la question à choix multiple (QCM) suivante et fournis une explication détaillée pour chaque option, identifiant la ou les réponse(s) juste(s).\n"${currentQuestion.text}\nOptions:\n${optionsString}"`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}&udm=50`;
    window.open(searchUrl, "_blank");
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
    const moduleMap: { [module: string]: { total: number; correct: number } } = {};

    filteredQuestions.forEach(q => {
      const moduleName = q.module || 'Unknown';
      if (!moduleMap[moduleName]) {
        moduleMap[moduleName] = { total: 0, correct: 0 };
      }

      moduleMap[moduleName].total++;

      const userAnswers = answers[q.id] || [];
      const correctAnswers = (q.correctOptionIds || []).map(Number);

      if (arraysEqual(userAnswers, correctAnswers)) {
        moduleMap[moduleName].correct++;
      }
    });

    return Object.keys(moduleMap).map(module => ({
      module,
      total: moduleMap[module].total,
      correct: moduleMap[module].correct,
      accuracy: (moduleMap[module].correct / moduleMap[module].total) * 100,
    }));
  };

  if (!currentQuestion) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "#f4f4ea",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#353533] mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const moduleStats = getModuleBreakdown();

    return (
      <div
        className="min-h-screen p-4 sm:p-6"
        style={{
          background: "#f4f4ea",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#212121] rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 animate-fadeIn shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#eceadd] mb-2">
                Quiz Terminé!
              </h2>
              <p className="text-lg sm:text-xl text-[#eff0e9] opacity-70">
                Voici vos résultats
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-[#373734] rounded-xl p-6 text-center border-2 border-[#c1c2bb]">
                <div className="text-4xl sm:text-5xl font-bold text-[#eceadd] mb-2">
                  {score.correct}
                </div>
                <div className="text-sm text-[#eff0e9] opacity-70">Correctes</div>
              </div>
              <div className="bg-[#373734] rounded-xl p-6 text-center border-2 border-[#c1c2bb]">
                <div className="text-4xl sm:text-5xl font-bold text-[#eceadd] mb-2">
                  {score.total - score.correct}
                </div>
                <div className="text-sm text-[#eff0e9] opacity-70">Incorrectes</div>
              </div>
              <div className="bg-[#373734] rounded-xl p-6 text-center border-2 border-[#c1c2bb]">
                <div className="text-4xl sm:text-5xl font-bold text-[#eceadd] mb-2">
                  {score.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-[#eff0e9] opacity-70">Score</div>
              </div>
            </div>

            <div className="bg-[#373734] rounded-xl p-6 mb-6 border-2 border-[#c1c2bb]">
              <h3 className="text-xl font-bold text-[#eceadd] mb-4">
                Analyse par Module
              </h3>
              <div className="space-y-4">
                {moduleStats.map(stat => (
                  <div key={stat.module} className="bg-[#212121] rounded-lg p-4 border border-[#c1c2bb] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-[#f1f2ec]">
                        {stat.module}
                      </span>
                      <span className="text-sm text-[#eff0e9] opacity-70">
                        {stat.correct}/{stat.total}
                      </span>
                    </div>
                    <div className="w-full bg-[#373734] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${stat.accuracy}%`,
                          background: stat.accuracy >= 70 ? '#10b981' : stat.accuracy >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <div className="text-sm text-[#eff0e9] opacity-70 mt-1">
                      {stat.accuracy.toFixed(1)}% de précision
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all bg-[#faf9f5] text-[#54534f] hover:shadow-lg hover:scale-y-[1.015] hover:scale-x-[1.005] ease-[cubic-bezier(0.165,0.85,0.45,1)] duration-150"
              >
                <HomeIcon className="w-5 h-5" />
                Accueil
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all bg-[#373734] text-[#eceadd] border-2 border-[#c1c2bb] hover:bg-[#454542] hover:scale-y-[1.015] hover:scale-x-[1.005] ease-[cubic-bezier(0.165,0.85,0.45,1)] duration-150"
              >
                Revoir les Réponses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentConfirmed = confirmedAnswers.has(currentQuestion.id);
  const showCorrectAnswer = isCurrentConfirmed;

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{
        background: "#f4f4ea",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#212121] rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex flex-row items-start justify-between gap-4 mb-4">
            <div className="min-w-0"> {/* min-w-0 prevents text overflow issues in flex */}
              <h1 className="text-xl sm:text-3xl font-bold text-[#eceadd] mb-1 sm:mb-2 leading-tight">
                {config.module}
              </h1>
              <p className="text-xs sm:text-base text-[#eff0e9] opacity-70 truncate">
                {config.unit}
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#373734] text-[#eceadd] rounded-lg font-semibold border-2 border-[#c1c2bb] hover:bg-[#454542] transition-all"
            >
              <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base">Accueil</span>
            </button>
          </div>

          <div className="bg-[#373734] rounded-lg h-3 overflow-hidden border border-[#c1c2bb]">
            <div
              className="h-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-[#eff0e9] opacity-70 mt-2">
            Progression: {answeredCount} / {totalQuestions} questions
          </p>
        </div>

        {/* Question Card */}
        <div id="quiz-top" className="bg-[#212121] rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-6 sm:mb-8">
            {/* Main Header Container: Row on Desktop/Tablet, Column on tiny mobile if needed */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">

              {/* Left Side: Question Index & Course Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex-shrink-0 bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-base">
                  Q{currentQuestionIndex + 1}
                </span>

                {/* We map through the array to create individual badges for each course */}
                {currentQuestion.courseName && currentQuestion.courseName.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#373734] text-[#eceadd] rounded-full border border-purple-600/30 text-[10px] sm:text-xs font-medium whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>

              {/* Right Side: Action Buttons (Flag & Date) */}
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button
                  onClick={handleFlag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all text-xs sm:text-sm ${flaggedQuestions.has(currentQuestion.id)
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20"
                    : "bg-[#373734] text-[#eceadd] border border-[#c1c2bb]/30 hover:bg-[#454542] hover:border-purple-600/30"
                    }`}
                >
                  <Flag className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                  <span>Signaler</span>
                </button>

                {currentQuestion.Date && (
                  <a
                    href={getDateLink(currentQuestion.Date)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#373734] text-blue-400 rounded-full font-medium border border-[#c1c2bb]/30 hover:bg-[#454542] hover:border-purple-600/30 transition-all text-xs sm:text-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{currentQuestion.Date}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-[#eceadd] mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
              const isCorrect = (currentQuestion.correctOptionIds || []).map(Number).includes(option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full p-4 sm:p-5 rounded-lg font-semibold transition-all border-2 text-left ${isSelected && showCorrectAnswer && isCorrect
                    ? "border-green-500 bg-[#373734] text-[#e8eade]"
                    : isSelected && showCorrectAnswer && !isCorrect
                      ? "bg-[#373734] border-red-500 text-[#e8eade]"
                      : showCorrectAnswer && isCorrect
                        ? "border-green-500 bg-[#373734] text-[#e8eade]"
                        : isSelected
                          ? "bg-[#373734] border-purple-600 text-[#e8eade]"
                          : "bg-[#373734] border-[#c1c2bb] text-[#e8eade] hover:border-purple-400"
                    }`}
                  disabled={isCurrentConfirmed}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-lg flex-1">
                      {option.text}
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

            <button
              onClick={askGoogleSearch}
              /* Increased px-3 py-1.5 to px-5 py-2.5 for a larger footprint */
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#373734] to-[#2d2d2a] text-blue-400 rounded-full font-medium border border-blue-400/20 hover:border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.1)] transition-all"
            >
              {/* Increased w-4 h-4 to w-5 h-5 */}
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.48 10.92v3.28h4.74c-.2 1.06-1.2 3.12-4.74 3.12-3.07 0-5.57-2.54-5.57-5.68s2.5-5.68 5.57-5.68c1.75 0 2.92.74 3.59 1.39l2.59-2.5c-1.66-1.55-3.82-2.49-6.18-2.49-5.22 0-9.45 4.23-9.45 9.45s4.23 9.45 9.45 9.45c5.45 0 9.08-3.84 9.08-9.23 0-.62-.07-1.09-.15-1.57h-8.93z" />
              </svg>

              {/* Changed text-xs to text-sm (or text-base for even larger) */}
              <span className="text-sm font-bold tracking-wide uppercase">Analyse Google AI</span>
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#c1c2bb] mb-4 sm:mb-6 gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#373734] text-[#eceadd] rounded-lg font-semibold border-2 border-[#c1c2bb] hover:bg-[#454542] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Prev</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {!isCurrentConfirmed ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Confirmer</span>
                <span className="sm:hidden">Confirm</span>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#faf9f5] text-[#54534f] rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base hover:scale-y-[1.015] hover:scale-x-[1.005] ease-[cubic-bezier(0.165,0.85,0.45,1)] duration-150"
              >
                <span className="hidden sm:inline">Soumettre</span>
                <span className="sm:hidden">Submit</span>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  handleNext();
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Scrollable Pagination */}
          <div className="border-t border-[#c1c2bb] pt-4">
            <h4 className="text-xs sm:text-sm font-semibold text-[#f1f2ec] mb-2 sm:mb-3">
              Navigateur des Questions
            </h4>
            <div className="relative">
              <div
                ref={paginationRef}
                className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#373734 #f3f4f6'
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
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all text-xs sm:text-sm ${isCurrent
                        ? "bg-purple-600 text-white ring-2 ring-purple-300"
                        : isConfirmed && isCorrect
                          ? "bg-green-500 text-white"
                          : isConfirmed && !isCorrect
                            ? "bg-red-500 text-white"
                            : isAnswered
                              ? "bg-blue-100 text-blue-700"
                              : "bg-[#373734] text-[#eceadd] border border-[#c1c2bb] hover:bg-[#454542]"
                        } ${isFlagged ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              {/* Scroll hint for mobile */}
              <div className="text-xs text-[#eff0e9] opacity-70 text-center mt-2 sm:hidden">
                ← Glisser pour en voir plus →
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#212121] rounded-2xl shadow-2xl p-4 sm:p-6 mt-4 sm:mt-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <h3 className="text-sm sm:text-base font-semibold text-[#eceadd] mb-3 sm:mb-4">
            Stats Rapides
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-[#373734] rounded-lg border border-[#c1c2bb]">
              <div className="text-xl sm:text-2xl font-bold text-green-500">
                {answeredCount}
              </div>
              <div className="text-xs sm:text-sm text-[#eff0e9] opacity-70">Résolues</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#373734] rounded-lg border border-[#c1c2bb]">
              <div className="text-xl sm:text-2xl font-bold text-[#eceadd]">
                {totalQuestions - answeredCount}
              </div>
              <div className="text-xs sm:text-sm text-[#eff0e9] opacity-70">Restantes</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#373734] rounded-lg border border-[#c1c2bb]">
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                {flaggedQuestions.size}
              </div>
              <div className="text-xs sm:text-sm text-[#eff0e9] opacity-70">Signalé</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#eff0e9] opacity-85 mt-2 font-medium">
            ❓ Si vous soupçonnez une erreur, vous pouvez consulter la correction et sujet officielles en cliquant sur le bouton correspondant à la date de cette question ci-dessus.
          </p>
        </div>
      </div>

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


