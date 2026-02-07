// Home.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Hash, ArrowRight } from "lucide-react";

interface Question {
  id: number;
  text: string;
  unit: string;
  module: string;
  options: { id: number; text: string }[];
  correctOptionId: number;
  explanation: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedUnit, setselectedUnit] = useState<string>("");
  const [selectedModule, setselectedModule] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Load all JSON files
  useEffect(() => {
  const importModules = async () => {
    // grab all json files anywhere under ../data (including subfolders)
    const context = import.meta.glob("../data/**/*.json", { eager: true }) as Record<string, any>;

    const questions: Question[] = [];
    const unitSet = new Set<string>();
    const moduleList: { unit: string; name: string; path: string }[] = [];

    Object.entries(context).forEach(([path, mod]) => {
      // path example: "../data/UnitName/moduleName.json"
      const segments = path.split("/");
      const fileName = segments.pop()!.replace(".json", ""); // "moduleName"
      const unitName = segments.pop() ?? "root"; // "UnitName" (or "root" fallback)

      unitSet.add(unitName);
      moduleList.push({ unit: unitName, name: fileName, path });

      // content may be in `default` (because of eager import)
      const content = mod?.default ?? mod;

      // support two common JSON shapes:
      // 1) the file exports an array: [ {..question..}, ... ]
      // 2) the file exports an object with a `questions` array: { questions: [...] }
      if (Array.isArray(content)) {
        questions.push(...(content as Question[]));
      } else if (content && Array.isArray((content as any).questions)) {
        questions.push(...(content as any).questions);
      } else {
        console.warn(`Unexpected JSON format in ${path}`, content);
      }
    });

    // set state
    setUnits(Array.from(unitSet)); // ["UnitNameA", "UnitNameB", ...]
    // for modules we store "UnitName/moduleName" strings — change the format to your taste
    const grouped = Array.from(unitSet).map((u) => ({
    unit: u,
    modules: moduleList.filter(m => m.unit === u).map(m => m.name)
    }));
    setModules(grouped);
    setAllQuestions(questions);
  };

  importModules();
}, []);

  const handleStartQuiz = () => {
    if (selectedUnit && selectedModule && questionCount > 0) {
      // Filter questions by selected module
      const filteredQuestions = allQuestions
        .filter((q) => q.module.toLowerCase() === selectedUnit.toLowerCase())
        .slice(0, questionCount);

      navigate("/quiz", {
        state: {
          unit: selectedUnit,
          module: selectedUnit,
          questionCount,
          questions: filteredQuestions,
        },
      });
    }
  };

  const isFormValid = selectedUnit && selectedUnit && questionCount > 0;

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
          <h1 className="text-5xl font-bold text-white mb-4">QCM Blida</h1>
          <p className="text-xl text-purple-100">
            2ème Année Médecine
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Configure Votre Simulation
          </h2>

          <div className="space-y-6">
            {/* Module Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Sélectionnez l'Unité
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setselectedUnit(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Choisissez un Module</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                Sélectionnez le Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setselectedModule(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Sélectionnez l'année...</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Hash className="w-5 h-5 text-purple-600" />
                Nombre de Questions
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(parseInt(e.target.value) || 1)
                }
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">
                Choisissez entre 1 et 50 questions
              </p>
            </div>
          </div>

          {selectedUnit && selectedModule && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                Configuration de Simulation
              </h3>
              <div className="space-y-1 text-sm text-purple-700">
                <p>
                  <span className="font-semibold">Module:</span>{" "}
                  {selectedUnit}
                </p>
                <p>
                  <span className="font-semibold">L'Année</span> {selectedModule}
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
            Démarrer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-purple-100 text-sm">
          <p>
            Sélectionnez vos préférences ci-dessus pour commencer votre entraînement à l'examen médical.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;






