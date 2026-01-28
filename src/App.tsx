import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { generateScentRecommendation, type QuizAnswer, type ScentRecommendation } from '@/services/aiService';
import { ScentCompositionDiagram } from './components/ScentCompositionDiagram';

// Quiz questions data
const QUESTIONS = [
  {
    id: 1,
    // Model: Identity / Unity
    // Simplified for clear categorization.
    text: "First, what is the style of this scent?",
    options: [
      "Masculine & Bold (For Men)", 
      "Feminine & Elegant (For Women)", 
      "Modern & Neutral (Unisex)"
    ]
  },
  {
    id: 2,
    // Model: Sensory Marketing
    // Focuses on the immediate 'Top Note' reaction.
    text: "When you first spray it, how should it feel?",
    options: [
      "Fresh & Energetic", 
      "Calm & Relaxing", 
      "Mysterious & Deep", 
      "Clean & Pure"
    ]
  },
  {
    id: 3,
    // Model: Metaphor
    // Universal drinks/treats that translate well.
    text: "If this scent was a drink, what would it be?",
    options: [
      "Iced Citrus Cocktail (Cool & Sharp)", 
      "Rich Coffee or Hot Tea (Warm & Deep)", 
      "Sweet Pastry or Vanilla (Sweet & Cozy)", 
      "Glass of Wine (Romantic & Floral)"
    ]
  },
  {
    id: 4,
    // Model: Contextual Framing
    // Replaced "Domination mode" with clear use-cases.
    text: "Where will you wear this signature mix?",
    options: [
      "The Office (Professional & Leader)", 
      "Date Night (Seductive & Intimate)", 
      "Vacation & Outdoors (Free & Natural)", 
      "Relaxing at Home (Comfortable)"
    ]
  },
  {
    id: 5,
    // Model: Synesthesia
    // Temperature is a great way to describe scent without smelling it.
    text: "What is the perfect 'temperature' for this scent?",
    options: [
      "Warm Sunlight (Bright)", 
      "Cool Morning Mist (Airy)", 
      "Cozy Fireplace (Smoky/Woody)", 
      "Midnight Air (Cold/Dark)"
    ]
  },
  {
    id: 6,
    // Model: Social Proof / Status
    // Focuses on the compliment they want to receive.
    text: "When people smell you, what should they think?",
    options: [
      "They have great style (Cool)", 
      "They are successful (Powerful)", 
      "They are attractive (Sexy)", 
      "They are trustworthy (Clean)"
    ]
  },
  {
    id: 7,
    // Model: Tangibility
    // Connecting smell to touch helps the brain imagine the product.
    text: "If you could touch this scent, it would feel like...",
    options: [
      "Crisp White Shirt", 
      "Black Velvet", 
      "Soft Cashmere Sweater", 
      "Cool Polished Stone"
    ]
  },
  {
    id: 8,
    // Model: Jobs to Be Done
    // Crucial for the final emotional sell.
    text: "What is the 'Job' this perfume needs to do for you?",
    options: [
      "Confidence Armor (Make me feel strong)", 
      "Seduction Tool (Make me irresistible)", 
      "Mood Lifter (Make me feel happy)", 
      "Stress Buster (Make me feel calm)"
    ]
  },
  {
    id: 9,
    // Model: Endowment Effect & Gift Giving
    // *NEW* - This sets up the ZNS printing offer.
    text: "Finally, who is this masterpiece for?",
    options: [
      "For Myself (My Signature Scent)", 
      "A Gift (To impress someone special)"
    ]
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

              {/* Scent Composition Diagram */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-8"
              >
                <ScentCompositionDiagram components={recommendation.components} />
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
