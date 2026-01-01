import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Safety wrapper since we can't guarantee the key exists in this environment
const apiKey = process.env.API_KEY || "dummy_key_for_rendering";

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  if (!ai) {
    // Fallback if no API key is present in environment
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "I am running in a demo environment without a configured API key. In a production deployment, I would process: " + newMessage;
  }

  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct prompt from history
    const context = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Model'}: ${msg.text}`).join('\n');
    const prompt = `You are an expert AI Analyst for the Chaos Theorist financial infrastructure platform. 
    Current Conversation:\n${context}\nUser: ${newMessage}\nModel:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized financial systems analyst AI. Be concise, professional, and data-driven.",
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with AI service. Please check your network or API configuration.";
  }
};