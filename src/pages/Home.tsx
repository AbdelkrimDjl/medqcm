// Home.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Layers, Hash, ArrowRight } from "lucide-react";
import { Analytics } from "@vercel/analytics/next"

interface Question {
  id: number;
  text: string;
  module: string;
  options: { id: number; text: string }[];
  correctOptionIds: number[];
  explanation: string;
}

interface UnitData {
  unitName: string;
  modules: {
    moduleName: string;
    questions: Question[];
  }[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [allData, setAllData] = useState<UnitData[]>([]);
  const [availableQuestionCount, setAvailableQuestionCount] = useState<number>(0);

  // Load all JSON files from nested folder structure
  useEffect(() => {
    const importModules = async () => {
      const context = import.meta.glob("../data/**/*.json", { eager: true });
      const unitDataMap: Map<string, UnitData> = new Map();

      Object.entries(context).forEach(([path, module]) => {
        // Extract unit and module name from path
        // Path format: ../data/Unit 1/modulename.json
        const pathParts = path.split("/");
        const unitFolder = pathParts[pathParts.length - 2]; // e.g., "Unit 1"
        const fileName = pathParts[pathParts.length - 1].replace(".json", "");

        if (!unitDataMap.has(unitFolder)) {
          unitDataMap.set(unitFolder, {
            unitName: unitFolder,
            modules: [],
          });
        }

        const unitData = unitDataMap.get(unitFolder)!;
        unitData.modules.push({
          moduleName: fileName,
          // @ts-ignore
          questions: module.default || [],
        });
      });

      const unitsArray = Array.from(unitDataMap.values());
      setAllData(unitsArray);
      setUnits(unitsArray.map((u) => u.unitName).sort());
    };

    importModules();
  }, []);

  // Update available modules when unit is selected
  useEffect(() => {
    if (selectedUnit) {
      const unitData = allData.find((u) => u.unitName === selectedUnit);
      if (unitData) {
        const moduleNames = unitData.modules
          .map((m) => m.moduleName)
          .sort();
        setAvailableModules(moduleNames);
        setSelectedModule(""); // Reset module selection when unit changes
        setAvailableQuestionCount(0); // Reset question count
      }
    } else {
      setAvailableModules([]);
      setSelectedModule("");
      setAvailableQuestionCount(0);
    }
  }, [selectedUnit, allData]);

  // Update available question count when module is selected
  useEffect(() => {
    if (selectedUnit && selectedModule) {
      const unitData = allData.find((u) => u.unitName === selectedUnit);
      const moduleData = unitData?.modules.find(
        (m) => m.moduleName === selectedModule
      );
      
      if (moduleData) {
        const count = moduleData.questions.length;
        setAvailableQuestionCount(count);
        // Adjust question count if it exceeds available questions
        if (questionCount > count) {
          setQuestionCount(count);
        }
      }
    } else {
      setAvailableQuestionCount(0);
    }
  }, [selectedUnit, selectedModule, allData]);

  const handleStartQuiz = () => {
    if (selectedUnit && selectedModule && questionCount > 0) {
      // Find the selected unit and module
      const unitData = allData.find((u) => u.unitName === selectedUnit);
      const moduleData = unitData?.modules.find(
        (m) => m.moduleName === selectedModule
      );

      if (moduleData) {
        const questions = moduleData.questions.slice(0, questionCount);

        navigate("/quiz", {
          state: {
            unit: selectedUnit,
            module: selectedModule,
            questionCount,
            questions,
          },
        });
      }
    }
  };

  const isFormValid = selectedUnit && selectedModule && questionCount > 0;

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
          <h1 className="text-5xl font-bold text-white mb-4">MedQCM — Blida</h1>
          <p className="text-xl text-purple-100">
            2ème Année Médecine
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Configurer Votre Simulation
          </h2>

          <div className="space-y-6">
            {/* Unit Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Layers className="w-5 h-5 text-purple-600" />
                Sélectionner l'Unité
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Choisissez une Unité</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Sélectionner le Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedUnit}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedUnit
                    ? "Choisissez un Module"
                    : "Sélectionnez d'abord une Unité"}
                </option>
                {availableModules.map((module) => (
                  <option key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </option>
                ))}
              </select>
              {!selectedUnit && (
                <p className="text-sm text-gray-500 mt-2">
                  Veuillez d'abord sélectionner une unité
                </p>
              )}
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
                max={availableQuestionCount > 0 ? availableQuestionCount : 50}
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxValue = availableQuestionCount > 0 ? availableQuestionCount : 50;
                  setQuestionCount(Math.min(value, maxValue));
                }}
                disabled={!selectedModule}
                className="w-full p-4 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:border-purple-600 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {selectedModule && availableQuestionCount > 0 ? (
                <p className="text-sm text-gray-500 mt-2">
                  {availableQuestionCount} {availableQuestionCount === 1 ? 'question disponible' : 'questions disponibles'} pour ce module
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Sélectionnez un module pour voir les questions disponibles
                </p>
              )}
            </div>
          </div>

          {selectedUnit && selectedModule && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                Configuration de Simulation
              </h3>
              <div className="space-y-1 text-sm text-purple-700">
                <p>
                  <span className="font-semibold">Unité:</span> {selectedUnit}
                </p>
                <p>
                  <span className="font-semibold">Module:</span>{" "}
                  {selectedModule}
                </p>
                <p>
                  <span className="font-semibold">Questions:</span>{" "}
                  {questionCount} / {availableQuestionCount}
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



