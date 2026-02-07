import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Hash, ArrowRight } from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const modules = ["Cardiology", "Neurology"];
  const years = ["2023", "2025"];

  const handleStartQuiz = () => {
    if (selectedModule && selectedYear) {
      navigate("/quiz", {
        state: {
          module: selectedModule,
          year: selectedYear,
          questionCount: questionCount,
        },
      });
    }
  };

  const isFormValid = selectedModule && selectedYear && questionCount > 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">ExamGen Quiz</h1>
          <p className="text-xl text-purple-100">
            Medical Licensing Exam Preparation
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Configure Your Quiz
          </h2>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Select Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Choose a module...</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Choose a year...</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Hash className="w-5 h-5 text-purple-600" />
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(parseInt(e.target.value) || 1)
                }
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">
                Choose between 1 and 50 questions
              </p>
            </div>
          </div>

          {selectedModule && selectedYear && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                Quiz Configuration
              </h3>
              <div className="space-y-1 text-sm text-purple-700">
                <p>
                  <span className="font-semibold">Module:</span>{" "}
                  {selectedModule}
                </p>
                <p>
                  <span className="font-semibold">Year:</span> {selectedYear}
                </p>
                <p>
                  <span className="font-semibold">Questions:</span>{" "}
                  {questionCount}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={!isFormValid}
            className={`w-full mt-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
              isFormValid
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Quiz
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-purple-100 text-sm">
          <p>
            Select your preferences above to begin your medical exam practice
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
