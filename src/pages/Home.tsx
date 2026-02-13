// Home.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Files, BookOpen, Layers, Hash, ArrowRight, Play } from "lucide-react";

interface Question {
  id: number;
  text: string;
  module: string;
  courseName?: string[]; // Array of courses this question belongs to
  options: { id: number; text: string }[];
  correctOptionIds: number[];
  explanation: string;
}

interface Module {
  moduleName: string;
  questions: Question[];
}

interface UnitData {
  unitName: string;
  modules: Module[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [allData, setAllData] = useState<UnitData[]>([]);
  const [availableQuestionCount, setAvailableQuestionCount] = useState<number>(0);
  const [shouldShowModuleSelect, setShouldShowModuleSelect] = useState<boolean>(true);
  const [savedQuiz, setSavedQuiz] = useState<{
    key: string;
    config: any;
    progress: {
      answered: number;
      total: number;
      percent: number;
    };
  } | null>(null);
  const storageKey = `quiz_${selectedUnit}_${selectedModule}_${questionCount}`;

  useEffect(() => {
    const keys = Object.keys(localStorage);
    // Find the key that starts with quiz_
    const quizKey = keys.find(key => key.startsWith('quiz_') && !key.includes('fallback'));

    if (quizKey) {
      const savedDataRaw = localStorage.getItem(quizKey);
      const backupConfigRaw = localStorage.getItem('last_quiz_config');

      if (savedDataRaw && backupConfigRaw) {
        try {
          const parsedData = JSON.parse(savedDataRaw); // Declared here
          const config = JSON.parse(backupConfigRaw);

          // Use parsedData safely within this block
          const answeredCount = Object.keys(parsedData.savedAnswers || {}).length;
          const totalQuestions = config.questionCount || 0;
          const percentage = totalQuestions > 0
            ? Math.round((answeredCount / totalQuestions) * 100)
            : 0;

          setSavedQuiz({
            key: quizKey,
            config: config,
            progress: {
              answered: answeredCount,
              total: totalQuestions,
              percent: percentage
            }
          });
        } catch (error) {
          console.error("Error parsing saved quiz data:", error);
        }
      }
    }
  }, []);

  const handleContinueQuiz = () => {
    if (savedQuiz) {
      // Navigate using the recovered configuration
      navigate("/quiz", { state: savedQuiz.config });
    }
  };

  // Load all JSON files from nested folder structure
  useEffect(() => {
    const importModules = async () => {
      // Use glob pattern that matches both .json and .JSON (case-insensitive)
      const contextLower = import.meta.glob("../data/**/*.json", { eager: true });
      const contextUpper = import.meta.glob("../data/**/*.JSON", { eager: true });

      // Merge both contexts
      const context = { ...contextLower, ...contextUpper };
      const unitDataMap: Map<string, UnitData> = new Map();

      Object.entries(context).forEach(([path, module]) => {
        // Extract unit and module name from path
        // Path format: ../data/Unit 1/modulename.json or ../data/Génétique/Génétique.JSON
        const pathParts = path.split("/");
        const unitFolder = pathParts[pathParts.length - 2]; // e.g., "Système Endocrinien" or "Génétique"
        const fileName = pathParts[pathParts.length - 1].replace(/\.(json|JSON)$/i, "");

        if (!unitDataMap.has(unitFolder)) {
          unitDataMap.set(unitFolder, {
            unitName: unitFolder,
            modules: [],
          });
        }

        const unitData = unitDataMap.get(unitFolder)!;

        // @ts-ignore
        const questions = module.default || [];

        unitData.modules.push({
          moduleName: fileName,
          questions: Array.isArray(questions) ? questions : [],
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

        // Check if we should auto-select the module
        // Auto-select if: only one module AND module name matches unit name
        const shouldAutoSelect =
          moduleNames.length === 1 &&
          moduleNames[0].toLowerCase() === selectedUnit.toLowerCase();

        if (shouldAutoSelect) {
          setSelectedModule(moduleNames[0]);
          setShouldShowModuleSelect(false);
        } else {
          setSelectedModule(""); // Reset module selection when unit changes
          setShouldShowModuleSelect(true);
        }

        setSelectedCourse(""); // Reset course selection
        // Don't reset availableQuestionCount here - let the next useEffect handle it
      }
    } else {
      setAvailableModules([]);
      setSelectedModule("");
      setSelectedCourse("");
      setAvailableQuestionCount(0);
      setShouldShowModuleSelect(true);
    }
  }, [selectedUnit, allData]);

  // Update available courses when module is selected
  useEffect(() => {
    if (selectedUnit && selectedModule) {
      const unitData = allData.find((u) => u.unitName === selectedUnit);
      const moduleData = unitData?.modules.find(
        (m) => m.moduleName === selectedModule
      );

      if (moduleData) {
        // Extract unique course names from all questions in this module
        const courseSet = new Set<string>();

        moduleData.questions.forEach((question) => {
          if (question.courseName && Array.isArray(question.courseName)) {
            question.courseName.forEach((course) => {
              if (course && course.trim()) {
                courseSet.add(course.trim());
              }
            });
          }
        });

        const courseNames = Array.from(courseSet).sort();
        setAvailableCourses(courseNames);
        setSelectedCourse(""); // Reset course selection when module changes
      }
    } else {
      setAvailableCourses([]);
      setSelectedCourse("");
    }
  }, [selectedUnit, selectedModule, allData]);

  // Update available question count and auto-fill the input when filters change
  useEffect(() => {
    // 1. Handle "No Selection" state early
    if (!selectedUnit || !selectedModule) {
      setAvailableQuestionCount(0);
      setQuestionCount(0);
      return;
    }

    // 2. Drill down to the relevant questions
    const unitData = allData.find((u) => u.unitName === selectedUnit);
    const moduleData = unitData?.modules.find(
      (m) => m.moduleName === selectedModule
    );

    const questions = moduleData?.questions || [];

    // 3. Calculate count based on Course filter
    let count = 0;
    if (selectedCourse) {
      count = questions.filter((q) =>
        Array.isArray(q.courseName) && q.courseName.includes(selectedCourse)
      ).length;
    } else {
      count = questions.length;
    }

    // 4. Update both states to the total available count
    setAvailableQuestionCount(count);
    setQuestionCount(count);

  }, [selectedUnit, selectedModule, selectedCourse, allData]);

  const handleStartQuiz = () => {
    if (selectedUnit && selectedModule && questionCount > 0) {
      // Find the selected unit and module
      const unitData = allData.find((u) => u.unitName === selectedUnit);
      const moduleData = unitData?.modules.find(
        (m) => m.moduleName === selectedModule
      );

      if (moduleData) {
        let filteredQuestions: Question[] = [];

        if (selectedCourse) {
          // Filter questions that include the selected course
          filteredQuestions = moduleData.questions.filter((q) =>
            q.courseName &&
            Array.isArray(q.courseName) &&
            q.courseName.includes(selectedCourse)
          );
        } else {
          // No course selected, use all questions
          filteredQuestions = moduleData.questions;
        }

        const questions = filteredQuestions.slice(0, questionCount);
        localStorage.removeItem(storageKey);

        navigate("/quiz", {
          state: {
            unit: selectedUnit,
            module: selectedModule,
            course: selectedCourse || "Tous les Cours",
            questionCount,
            questions,
          },
        });
      }
    }
  };

  const isFormValid = selectedUnit && selectedModule && questionCount > 0 && availableQuestionCount > 0;
  const moduleHasCourses = selectedModule && availableCourses.length > 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "#f4f4ea",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20 mb-4 uppercase tracking-wider">
            Gemini AI intégré
          </span>
          <h1 className="text-5xl font-extrabold text-[#353533] mb-4 tracking-tight">
            MedQCM <span className="text-purple-600">—</span> Blida</h1>
          <p className="text-lg text-[#2e302f] max-w-lg mx-auto leading-relaxed opacity-80">
            Désormais, accédez aux examens de votre professeurs et entraînez-vous sur les QCM plus facilement que jamais. Progressez et comprenez chaque concept en profondeur grâce à Gemini AI intégré.
          </p>
        </div>

        {/* Add this inside the main return, before the config card */}
        {savedQuiz && (
          <div className="mb-6 animate-fadeIn">
            <div className="bg-[#212121] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="text-[#eceadd]/70">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 whitespace-nowrap overflow-hidden">
                  <Play className="w-5 h-5 text-purple-600 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    Session en cours ({savedQuiz.progress.percent}%)
                  </span>
                </h3>
                <p className="text-sm opacity-90">
                  {savedQuiz.config.unit} • {savedQuiz.config.module} • {savedQuiz.config.course || "Tous les Cours"}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleContinueQuiz}
                  className="flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold transition-all shadow-md bg-[#faf9f5] text-[#54534f] hover:shadow-lg hover:scale-y-[1.015] hover:scale-x-[1.005]"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#212121] rounded-2xl shadow-2xl p-8 font-normal shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-bold text-[#eceadd]/70 mb-6">
            Configurer Votre Questionnaire
          </h2>

          <div className="space-y-8">
            {/* Unit Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#f1f2ec] mb-3">
                <Layers className="w-5 h-5 text-purple-600 opacity-80" />
                Sélectionnez l'Unité
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-4 border-2 border-white/10 rounded-xl font-semibold text-[#e8eade] focus:border-[#c1c2bb] focus:outline-none transition-all bg-[#373734]"
              >
                <option value="">Choisissez une Unité</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Select - Only show if needed */}
            {shouldShowModuleSelect && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#f1f2ec] mb-3">
                  <BookOpen className="w-5 h-5 text-purple-600 opacity-80" />
                  Sélectionnez le Module
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedUnit}
                  className="w-full p-4 border-2 border-white/10 rounded-xl font-semibold text-[#e8eade] focus:border-[#c1c2bb] focus:outline-none transition-all bg-[#373734] disabled:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
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
                  <p className="text-sm text-[#eff0e9] opacity-70 mt-2">
                    Veuillez d'abord sélectionner une unité
                  </p>
                )}
              </div>
            )}

            {/* Course Select - Only show if module has courses */}
            {moduleHasCourses && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#f1f2ec] mb-3">
                  <Files className="w-5 h-5 text-purple-600 opacity-80" />
                  Sélectionnez le Cours (Optionnel)
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-4 border-2 border-white/10 rounded-xl font-semibold text-[#e8eade] focus:border-[#c1c2bb] focus:outline-none transition-all bg-[#373734]"
                >
                  <option value="">Tous les Cours</option>
                  {availableCourses.map((course) => (
                    <option key={course} value={course}>
                      {course.charAt(0).toUpperCase() + course.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-[#eff0e9] opacity-70 mt-2">
                  Laissez vide pour inclure toutes les questions du module
                </p>
              </div>
            )}

            {/* Question Count */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#f1f2ec] mb-3">
                <Hash className="w-5 h-5 text-purple-600 opacity-80" />
                Nombre de Questions
              </label>
              <input
                type="number"
                min={1}
                max={availableQuestionCount > 0 ? availableQuestionCount : 999}
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxValue = availableQuestionCount > 0 ? availableQuestionCount : 999;
                  setQuestionCount(Math.min(Math.max(1, value), maxValue));
                }}
                disabled={!selectedModule || availableQuestionCount === 0}
                className="w-full p-4 bg-[#373734] border-2 border-white/10 rounded-xl font-semibold text-[#e8eade] focus:border-[#c1c2bb] focus:outline-none transition-all disabled:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
              />
              {selectedModule && availableQuestionCount > 0 ? (
                <p className="text-sm text-[#eff0e9] opacity-70 mt-2">
                  {availableQuestionCount} {availableQuestionCount === 1 ? 'question disponible' : 'questions disponibles'}
                  {selectedCourse ? ` pour le cours "${selectedCourse}"` : ' pour ce module'}
                </p>
              ) : selectedModule && availableQuestionCount === 0 ? (
                <p className="text-sm text-red-400 mt-2">
                  Aucune question disponible pour cette sélection
                </p>
              ) : (
                <p className="text-sm text-[#eff0e9] opacity-70 mt-2">
                  Sélectionnez un module pour voir les questions disponibles
                </p>
              )}
            </div>
          </div>

          {selectedUnit && selectedModule && availableQuestionCount > 0 && (
            <div className="mt-6 p-4 bg-[#373734] rounded-xl border border-[#c1c2bb]">
              <h3 className="font-semibold text-[#f1f2ec] mb-2">
                Configuration de Questionnaire
              </h3>
              <div className="space-y-1 text-sm text-[#eff0e9] opacity-70">
                <p>
                  <span className="font-semibold">Unité:</span> {selectedUnit}
                </p>
                <p>
                  <span className="font-semibold">Module:</span>{" "}
                  {selectedModule}
                </p>
                {moduleHasCourses && (
                  <p>
                    <span className="font-semibold">Cours:</span>{" "}
                    {selectedCourse || "Tous les Cours"}
                  </p>
                )}
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
            className={`w-full mt-8 py-4 rounded-xl font-semibold text-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ease-[cubic-bezier(0.165,0.85,0.45,1)] duration-150 hover:scale-y-[1.015] hover:scale-x-[1.005] ${isFormValid
              ? "bg-[#faf9f5] text-[#54534f] hover:shadow-lg"
              : "bg-[#faf9f5] text-gray-400 cursor-not-allowed"
              }`}
          >
            Démarrer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-[#353533] text-sm">
          <p>
            MedQCM — Plateforme d'entraînement pour les étudiants en médecine de Blida
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
