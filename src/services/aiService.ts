import { GoogleGenerativeAI } from '@google/generative-ai';
import { inventoryData } from './inventoryData';

export interface QuizAnswer {
  questionId: number;
  question: string;
  answer: string;
}

export interface ScentComponent {
  item_id: number;
  code: string;
  name: string;
  percentage: number;
  type: 'PERFUME_ESSENCE' | 'SUPPORT_NOTE';
  reason: string;
}

export interface ScentRecommendation {
  blendName: string;
  description: string;
  components: ScentComponent[];
  reasoning: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Build the AI prompt with quiz answers and inventory
const buildAIPrompt = (answers: QuizAnswer[]): string => {
  const answersText = answers.map((a, i) => 
    `Q${i + 1}: "${a.question}"\nA${i + 1}: "${a.answer}"`
  ).join('\n\n');

  return `You are an expert Perfume Formulator and Scent Psychologist. You do not just mix liquids; you translate a user's personality, memories, and aspirations into a signature scent identity.

YOUR GOAL:
The user has just invested effort into a quiz about their identity (The IKEA Effect). You must reward them with a result that feels hyper-personalized. Use "Cold Reading" techniques—make specific, insightful statements about who they are based on their abstract answers.

INVENTORY:
${inventoryData}

USER PROFILE (QUIZ ANSWERS):
${answersText}

---
STRICT BLENDING RULES (The Science):
1. Total Blend = 100%.
2. Foundation (PERFUME_ESSENCE type): Select 1 or 2 items from the PERFUMES section. MUST sum to over 80% total, till 95% (e.g., 40% + 40%, or 45% + 35%, or 50% + 30%). These define the core character.
3. Accent (SUPPORT_NOTE type): Select EXACTLY 1 item from the CANDLES section. MUST be the left % from the Foundation total. This adds the unique twist or "top note" spark.
4. Type Validation: PERFUME_ESSENCE items come from the "PERFUMES" section. SUPPORT_NOTE items come from the "CANDLES - Support Notes" section.
5. Compatibility: You are the expert. Ensure the Main and Support notes do not chemically clash (e.g., avoid mixing heavy Oud with light Marine unless creating a specific "Paradox" vibe).
6. Constraints: Use ONLY the provided Inventory codes. Do not hallucinate ingredients.

---
PSYCHOLOGICAL OUTPUT INSTRUCTIONS (The Art):

1. BLEND NAME:
   Create a name that sounds like a high-end niche brand (e.g., "Midnight Alchemist," "Velvet Echo"). Avoid generic names like "My Floral Scent." The name should imply ownership and status.

2. SCENT PROFILE DESCRIPTION (The Hook):
   Write a 30-50 word sensory narrative. Do not just list notes. Describe the *feeling*.
   - Use "You" phrasing to trigger the Endowment Effect (e.g., "Your signature scent opens with...").
   - Mention the luxury inspiration from 'similarTo' if available, but frame it as a peer, not a copy (e.g., "Rivalling the depth of [SimilarTo], but tailored for your specific chemistry...").

3. REASONING (The Validation):
   This is the most important part. You must explain *why* this mix fits their *specific* quiz answers.
   - Connect "Abstract" to "Concrete": "Because you chose [Answer: 'Dark Velvet'], we used a heavy amber base to give that tactile warmth."
   - Connect "Job to be Done" to "Ingredient": "To achieve the [Answer: 'Confidence'] you asked for, we added a sharp citrus top note to subconsciously trigger alertness."
   - Tone: Validating, insightful, and authoritative.

4. COMPONENT REASONING:
   For each individual ingredient, give a 5-word "Why". E.g., "Adds the requested 'Crisp Linen' texture."

---
OUTPUT LANGUAGE: ENGLISH. Tone: Modern, premium, and direct.

---
OUTPUT FORMAT:
Return ONLY a valid JSON object:

{
  "blendName": string,
  "description": string,
  "components": [
    {
      "item_id": number,
      "code": string,
      "name": string,
      "percentage": number,
      "type": string,
      "reason": string
    }
  ],
  "reasoning": string
}

REMEMBER: Your output must be valid JSON only. No markdown, no explanations outside the JSON.`;
};

// AI API call - Uses Google Gemini for scent recommendations
export const generateScentRecommendation = async (
  answers: QuizAnswer[]
): Promise<ScentRecommendation> => {
  const prompt = buildAIPrompt(answers);
  
  try {
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log('AI response content:', aiResponse);
    
    // Parse the JSON response
    // Sometimes AI wraps JSON in markdown code blocks, so we need to extract it
    let jsonString = aiResponse.trim();
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }
    
    console.log('JSON string to parse:', jsonString);
    
    if (!jsonString) {
      throw new Error('Empty JSON string from AI');
    }
    
    const recommendation: ScentRecommendation = JSON.parse(jsonString);
    
    // Validate the recommendation
    if (!recommendation.blendName || !recommendation.components || recommendation.components.length === 0) {
      throw new Error('Invalid recommendation format');
    }
    
    return recommendation;
  } catch (error) {
    console.error('Error calling AI:', error);
    // Fallback to mock recommendation if API fails
    return generateMockRecommendation(answers);
  }
};

// Generate a mock recommendation based on quiz answers
const generateMockRecommendation = (answers: QuizAnswer[]): ScentRecommendation => {
  const answer8 = answers[7]?.answer || '';
  const answer1 = answers[0]?.answer || '';
  const answer4 = answers[3]?.answer || '';
  
  // Determine blend based on "Job to be Done" (Q8)
  if (answer8.includes('Confidence')) {
    return {
      blendName: "Executive Dominion",
      description: "A commanding composition that opens with bold cedarwood authority, layered with the unmistakable presence of Royal Success. The subtle warmth of Sacred Oud provides a foundation of quiet power that lingers with executive gravitas.",
      components: [
        {
          item_id: 1,
          code: "MRF-1700015",
          name: "Terra Gold",
          percentage: 50,
          type: "PERFUME_ESSENCE",
          reason: "Provides confident woody foundation"
        },
        {
          item_id: 20,
          code: "MRF-1759004",
          name: "Royal Success",
          percentage: 35,
          type: "PERFUME_ESSENCE",
          reason: "Adds commanding presence"
        },
        {
          item_id: 254,
          code: "MRF-1740180",
          name: "Sacred Oud",
          percentage: 15,
          type: "SUPPORT_NOTE",
          reason: "Provides deep grounding base"
        }
      ],
      reasoning: `Your choice of "${answer4}" guided us to Terra Gold—its cedarwood and vetiver create an aura of executive presence. For the "Confidence Armor" you desire, Royal Success's birch wood adds an unmistakable power signature. The subtle depth of Sacred Oud provides the grounding foundation that completes your commanding scent.`
    };
  }
  
  if (answer8.includes('Seduction')) {
    return {
      blendName: "Velvet Nocturne",
      description: "Your signature scent unfolds like a secret garden at midnight—dark rose petals wrapped in the smoky mystery of oud, creating an intimate aura that draws them closer. The warmth of vanilla lingers like a whispered promise.",
      components: [
        {
          item_id: 15,
          code: "MRF-1701442",
          name: "Parisian Chic",
          percentage: 45,
          type: "PERFUME_ESSENCE",
          reason: "Creates elegant romantic base"
        },
        {
          item_id: 35,
          code: "MRF-1759797",
          name: "Dark Matter",
          percentage: 40,
          type: "PERFUME_ESSENCE",
          reason: "Adds mysterious oud depth"
        },
        {
          item_id: 10,
          code: "MRF-1740018",
          name: "Velvet Rose",
          percentage: 15,
          type: "SUPPORT_NOTE",
          reason: "Provides warm floral finish"
        }
      ],
      reasoning: `Your choice of "${answer4}" guided us to Parisian Chic—its Turkish rose creates an atmosphere of elegant romance. For the "Seduction Tool" you desire, Dark Matter's oud adds an irresistible mysterious depth. The warmth of Velvet Rose provides the intimate foundation that completes your alluring scent.`
    };
  }
  
  if (answer8.includes('Mood')) {
    return {
      blendName: "Sunlit Bloom",
      description: "A radiant composition that bursts with joyful citrus and golden florals, lifting your spirits with every breath. The playful sweetness of peach nectar dances with fresh gardenia, creating an aura of pure happiness.",
      components: [
        {
          item_id: 5,
          code: "MRF-1700045",
          name: "Gardenia Glow",
          percentage: 50,
          type: "PERFUME_ESSENCE",
          reason: "Creates joyful floral heart"
        },
        {
          item_id: 23,
          code: "MRF-1759084",
          name: "Glamour Pop",
          percentage: 35,
          type: "PERFUME_ESSENCE",
          reason: "Adds playful energy"
        },
        {
          item_id: 21,
          code: "MRF-1740328",
          name: "Golden Nectar",
          percentage: 15,
          type: "SUPPORT_NOTE",
          reason: "Provides sweet happy base"
        }
      ],
      reasoning: `Your choice of "${answer4}" guided us to Gardenia Glow—its white florals induce a sense of openness and joy. For the "Mood Lifter" you desire, Glamour Pop's passionfruit triggers dopamine production. The sweetness of Golden Nectar provides the cheerful foundation that completes your happy scent.`
    };
  }
  
  if (answer8.includes('Stress')) {
    return {
      blendName: "Serene Sanctuary",
      description: "A calming embrace of lavender and white tea that soothes the mind with every breath. The gentle powdery notes of violet create a peaceful cocoon, melting away tension and restoring inner balance.",
      components: [
        {
          item_id: 4,
          code: "MRF-1700035",
          name: "Amethyst Bloom",
          percentage: 50,
          type: "PERFUME_ESSENCE",
          reason: "Creates calming violet base"
        },
        {
          item_id: 16,
          code: "MRF-1702102",
          name: "Pure Unity",
          percentage: 35,
          type: "PERFUME_ESSENCE",
          reason: "Adds green tea tranquility"
        },
        {
          item_id: 105,
          code: "MRF-1740249",
          name: "Cashmere Lavender",
          percentage: 15,
          type: "SUPPORT_NOTE",
          reason: "Provides deep sleep support"
        }
      ],
      reasoning: `Your choice of "${answer4}" guided us to Amethyst Bloom—its violet soothes nervous tension. For the "Stress Buster" you desire, Pure Unity's green tea promotes Alpha Brain Waves for calm focus. The lavender in Cashmere Lavender provides the peaceful foundation that completes your grounding scent.`
    };
  }
  
  // Default based on gender preference
  if (answer1.includes('masculine')) {
    return {
      blendName: "Midnight Alchemist",
      description: "A bold fusion of marine freshness and woody strength that commands attention. The crisp edge of Azure Mist meets the primal power of Midnight Storm, creating an aura of effortless masculine confidence.",
      components: [
        {
          item_id: 2,
          code: "MRF-1700032",
          name: "Azure Mist",
          percentage: 45,
          type: "PERFUME_ESSENCE",
          reason: "Provides fresh aquatic opening"
        },
        {
          item_id: 11,
          code: "MRF-1700942",
          name: "Midnight Storm",
          percentage: 40,
          type: "PERFUME_ESSENCE",
          reason: "Adds bold spicy depth"
        },
        {
          item_id: 32,
          code: "MRF-1740322",
          name: "Azure Coast",
          percentage: 15,
          type: "SUPPORT_NOTE",
          reason: "Provides marine freshness"
        }
      ],
      reasoning: `Your preference for "${answer1}" guided us to Azure Mist—its marine notes create a fresh, modern masculinity. For the energy you desire, Midnight Storm's pepper and ambroxan add bold confidence. The marine freshness of Azure Coast provides the clean foundation that completes your powerful scent.`
    };
  }
  
  // Default feminine
  return {
    blendName: "Crystal Bloom",
    description: "A delicate symphony of peony and lotus that captures pure feminine grace. The luminous sparkle of Crystal Peony dances with the soft elegance of Tender Pink, creating an aura of timeless beauty.",
    components: [
      {
        item_id: 9,
        code: "MRF-1700087",
        name: "Crystal Peony",
        percentage: 50,
        type: "PERFUME_ESSENCE",
        reason: "Creates graceful floral heart"
      },
      {
        item_id: 13,
        code: "MRF-1701309",
        name: "Tender Pink",
        percentage: 35,
        type: "PERFUME_ESSENCE",
        reason: "Adds soft feminine elegance"
      },
      {
        item_id: 19,
        code: "MRF-1740107",
        name: "Peony Silk",
        percentage: 15,
        type: "SUPPORT_NOTE",
        reason: "Provides romantic floral base"
      }
    ],
    reasoning: `Your preference for "${answer1}" guided us to Crystal Peony—its peony and lotus create an atmosphere of graceful femininity. For the elegance you desire, Tender Pink's grapefruit and quince add soft sophistication. The peony in Peony Silk provides the romantic foundation that completes your beautiful scent.`
  };
};
