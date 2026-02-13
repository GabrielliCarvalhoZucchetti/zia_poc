
import { GoogleGenAI } from "@google/genai";

// generateAgentResponse handles AI content generation using the Gemini API.
export const generateAgentResponse = async (
  prompt: string, 
  history: { role: string; content: string }[],
  systemInstruction?: string
) => {
  try {
    // Initializing the GenAI client with named parameter and direct process.env.API_KEY reference.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using ai.models.generateContent to fetch AI response with conversation history and system instruction.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model' as any, 
          parts: [{ text: h.content }] 
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction || "You are ZIA, a highly capable AI agent manager. Assist the user with their queries.",
        temperature: 0.7,
      },
    });

    // Directly access the .text property of the GenerateContentResponse object.
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the AI service. Please check your configuration.";
  }
};
