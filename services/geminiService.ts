import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WorkoutPlan, Difficulty, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Workout Plan Generation
const workoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy name for the workout" },
    description: { type: Type.STRING, description: "Brief overview of goals" },
    estimatedDuration: { type: Type.STRING, description: "e.g. '45 mins'" },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          sets: { type: Type.NUMBER },
          reps: { type: Type.STRING, description: "e.g. '8-12' or 'Failure'" },
          rest: { type: Type.STRING, description: "Rest time in seconds or minutes" },
          instructions: { type: Type.STRING, description: "Short form cue" },
          muscleGroup: { type: Type.STRING },
          videoQuery: { type: Type.STRING, description: "A precise search term to find a video tutorial for this exercise, e.g. 'How to do Dumbbell Goblet Squat'" }
        },
        required: ["name", "sets", "reps", "rest", "instructions", "muscleGroup"]
      }
    }
  },
  required: ["title", "description", "estimatedDuration", "exercises"]
};

export const generateWorkoutPlan = async (
  goal: string,
  equipment: string,
  difficulty: Difficulty,
  duration: string,
  focus: string
): Promise<WorkoutPlan> => {
  const prompt = `Create a structured workout plan.
  Goal: ${goal}
  Equipment Available: ${equipment}
  Difficulty Level: ${difficulty}
  Desired Duration: ${duration}
  Focus Muscle Groups: ${focus}
  
  Ensure the exercises are safe and appropriate for the level. Provide clear, short instructions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
        systemInstruction: "You are an elite strength and conditioning coach designed to create highly effective, science-based workout programs.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    return {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...data
    };
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
};

export const getFitnessAdvice = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are an encouraging, knowledgeable, and safe fitness coach. Answer questions about form, nutrition, recovery, and motivation. Keep answers concise (under 150 words) unless asked for detail.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't process that request. Let's try again.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble connecting to the fitness database right now.";
  }
};
