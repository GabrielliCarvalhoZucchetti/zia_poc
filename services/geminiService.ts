

// generateAgentResponse handles AI content generation using the Gemini API.
export const generateAgentResponse = async (
  prompt: string, 
  history: { role: string; content: string }[],
  systemInstruction?: string
) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, history, systemInstruction })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the AI service. Please check your configuration.";
  }
};
