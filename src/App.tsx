import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { generateScentRecommendation, type QuizAnswer, type ScentRecommendation } from '@/services/aiService';

// Quiz questions data
const QUESTIONS = [
  {
    id: 1,
    text: "Let's start with the foundation. What kind of energy should this fragrance radiate?",
    options: ["Deep, bold, and masculine leaning", "Soft, elegant, and feminine leaning", "Neutral, modern, and fluid (Unisex)"]
  },
  {
    id: 2,
    text: "You've just sprayed it on. How does the opening moment make you feel?",
    options: ["Awake and Electric", "Calm and Centered", "Wrapped in Mystery", "Clean and Polished"]
  },
  {
    id: 3,
    text: "If this scent were a drink or a treat, what would it be?",
    options: ["A crisp Gin & Tonic with extra lime", "A rich, dark espresso or spiced chai", "A glass of rosé in a garden", "Vanilla bourbon or a warm pastry"]
  },
  {
    id: 4,
    text: "Close your eyes. Where are you when you're wearing this signature mix?",
    options: ["Domination mode: Boardrooms and city streets", "Intimate mode: Candlelight and close quarters", "Escape mode: Ocean air or deep woods", "Comfort mode: Fresh sheets and a rainy Sunday"]
  },
  {
    id: 5,
    text: "What is the perfect 'temperature' for this scent?",
    options: ["Sunlight on skin (Warm, bright)", "Cool morning mist (Crisp, airy)", "A crackling fireplace (Cozy, smoky)", "Midnight air (Cool, deep)"]
  },
  {
    id: 6,
    text: "You walk past someone and leave a scent trail. What do they think?",
    options: ["That person is effortlessly cool", "That person is powerful", "That person is dangerously attractive", "That person is clean and trustworthy"]
  },
  {
    id: 7,
    text: "If you could touch this scent, what would it feel like?",
    options: ["Crisp white linen", "Heavy black velvet", "Warm cashmere sweater", "Cool polished stone"]
  },
  {
    id: 8,
    text: "Finally, what is the 'Job' this perfume needs to do for you?",
    options: ["Confidence Armor: Make me feel invincible", "Seduction Tool: Make me irresistible", "Mood Lifter: Make me feel happy", "Stress Buster: Make me feel grounded"]
  }
];

type AppState = 'landing' | 'quiz' | 'loading' | 'reveal-button' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [progress, setProgress] = useState(12.5);
  const [recommendation, setRecommendation] = useState<ScentRecommendation | null>(null);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      if (appState === 'landing') {
        setAppState('quiz');
      }
      setCurrentQuestion(currentQuestion + 1);
      setProgress(((currentQuestion + 2) / QUESTIONS.length) * 100);
    } else {
      // Quiz complete - generate recommendation
      setAppState('loading');
      setProgress(100);
      
      // Build quiz answers for AI
      const quizAnswers: QuizAnswer[] = newAnswers.map((ans, idx) => ({
        questionId: QUESTIONS[idx].id,
        question: QUESTIONS[idx].text,
        answer: ans
      }));
      
      // Add the last answer
      quizAnswers.push({
        questionId: QUESTIONS[currentQuestion].id,
        question: QUESTIONS[currentQuestion].text,
        answer: answer
      });
      
      try {
        const result = await generateScentRecommendation(quizAnswers);
        setRecommendation(result);
        setAppState('reveal-button');
      } catch (error) {
        console.error('Error generating recommendation:', error);
        // Fallback to default recommendation
        setRecommendation({
          blendName: "Signature Blend",
          description: "A unique composition crafted just for you.",
          components: [
            { item_id: 1, code: "MRF-1700015", name: "Terra Gold", percentage: 50, type: "PERFUME_ESSENCE", reason: "Provides confident foundation" },
            { item_id: 15, code: "MRF-1701442", name: "Parisian Chic", percentage: 35, type: "PERFUME_ESSENCE", reason: "Adds elegant depth" },
            { item_id: 10, code: "MRF-1740018", name: "Velvet Rose", percentage: 15, type: "SUPPORT_NOTE", reason: "Provides warm base" }
          ],
          reasoning: "Based on your quiz answers, we've created a personalized blend that matches your preferences."
        });
        setAppState('reveal-button');
      }
    }
  };

  const handleReveal = () => {
    setAppState('results');
  };

  const handleRetake = () => {
    setAppState('landing');
    setCurrentQuestion(0);
    setAnswers([]);
    setProgress(12.5);
    setRecommendation(null);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
      <AnimatePresence mode="wait">
        {/* LANDING SCREEN */}
        {appState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Hero Section - Apple Style */}
            <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-black flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-black mb-6"
                >
                  Discover Your
                  <br />
                  Signature Scent
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-neutral-500 max-w-2xl mx-auto"
                >
                  Answer 8 simple questions and our AI perfumer will craft a personalized scent formula just for you.
                </motion.p>
              </div>
            </div>
            
            {/* First Question */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex-1 px-4 pb-16"
            >
              <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-neutral-400 mb-2">
                    <span className="text-neutral-500">Question 1 of 8</span>
                    <span className="text-neutral-500">12%</span>
                  </div>
                  <Progress value={12.5} className="h-1 bg-neutral-200" />
                </div>
                
                {/* Question Card - Minimal */}
                <div className="bg-neutral-50 rounded-3xl p-8 sm:p-10">
                  <h2 className="text-2xl sm:text-3xl font-medium mb-8 text-black leading-snug">
                    {QUESTIONS[0].text}
                  </h2>
                  
                  <div className="space-y-3">
                    {QUESTIONS[0].options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-5 rounded-2xl bg-white border border-neutral-200 hover:border-black hover:shadow-lg transition-all duration-200"
                      >
                        <span className="text-neutral-700 font-medium">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* QUIZ SCREEN */}
        {appState === 'quiz' && currentQuestion > 0 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen flex flex-col justify-center px-4 py-12"
          >
            <div className="max-w-2xl mx-auto w-full">
              {/* Progress Bar */}
              <div className="mb-10">
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                  <span className="text-neutral-500">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                  <span className="text-neutral-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1 bg-neutral-200" />
              </div>
              
              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-neutral-50 rounded-3xl p-8 sm:p-10"
                >
                  <h2 className="text-2xl sm:text-3xl font-medium mb-8 text-black leading-snug">
                    {QUESTIONS[currentQuestion].text}
                  </h2>
                  
                  <div className="space-y-3">
                    {QUESTIONS[currentQuestion].options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="w-full text-left p-5 rounded-2xl bg-white border border-neutral-200 hover:border-black hover:shadow-lg transition-all duration-200"
                      >
                        <span className="text-neutral-700 font-medium">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* LOADING SCREEN */}
        {appState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            <div className="text-center">
              {/* Minimal loading animation */}
              <div className="relative w-24 h-24 mx-auto mb-10">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-neutral-200"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-t-2 border-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-semibold mb-3 text-black"
              >
                Crafting Your Formula
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-neutral-500"
              >
                Analyzing your preferences...
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* REVEAL BUTTON SCREEN */}
        {appState === 'reveal-button' && (
          <motion.div
            key="reveal-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-black flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-4xl font-semibold mb-4 text-black">
                Your Scent is Ready
              </h2>
              
              <p className="text-neutral-500 mb-10 max-w-md mx-auto">
                We've crafted a unique fragrance formula based on your answers.
              </p>
              
              <motion.button
                onClick={handleReveal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white font-medium text-lg px-10 py-4 rounded-full hover:bg-neutral-800 transition-colors"
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                Reveal My Scent
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {appState === 'results' && recommendation && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-16 px-4"
          >
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  Your Signature Scent
                </div>
                <h1 className="text-5xl sm:text-6xl font-semibold text-black tracking-tight mb-8">
                  {recommendation.blendName}
                </h1>
                
                {/* Reasoning - Moved under scent name */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-neutral-50 rounded-3xl p-8 sm:p-10 mb-8 text-left"
                >
                  <h3 className="text-lg font-medium mb-4 text-neutral-500 uppercase tracking-wider">This scent is exclusive made for you cause:</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </motion.div>
              </motion.div>
              
              {/* Description Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-50 rounded-3xl p-8 sm:p-10 mb-8"
              >
                <p className="text-xl text-neutral-700 leading-relaxed">
                  {recommendation.description}
                </p>
              </motion.div>
              
              {/* Components */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-10"
              >
                <h3 className="text-lg font-medium mb-6 text-neutral-500 uppercase tracking-wider">Your Formula</h3>
                <div className="space-y-4">
                  {recommendation.components.map((component, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-center gap-5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-white">{component.percentage}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            component.type === 'PERFUME_ESSENCE' 
                              ? 'bg-black text-white' 
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {component.type === 'PERFUME_ESSENCE' ? 'Perfume Essence Notes' : 'Support Notes'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 font-medium mb-1">#{component.item_id}</p>
                        <h4 className="text-xl font-semibold text-black">{component.name}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  onClick={handleRetake}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-8 py-4 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:border-black hover:text-black transition-colors"
                >
                  <RefreshCw className="inline w-5 h-5 mr-2" />
                  Retake Quiz
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-8 py-4 rounded-full bg-black text-white font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Zap className="inline w-5 h-5 mr-2" />
                  Order Your Blend
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
