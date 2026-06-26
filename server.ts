import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware
  app.use(express.json());

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Gemini Proxy
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, history, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      let lastError: any = null;
      let responseText = "";

      for (const modelName of modelsToTry) {
        let attempt = 0;
        const maxRetries = 2;
        let success = false;

        while (attempt <= maxRetries) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                ...(history || []).map((h: any) => ({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.content }]
                })),
                { role: 'user', parts: [{ text: prompt }] }
              ],
              config: {
                systemInstruction: systemInstruction || "You are Luna, a highly capable AI agent manager. Assist the user with their queries.",
                temperature: 0.7,
              },
            });
            responseText = response.text || "";
            lastError = null; // reset if successful
            success = true;
            break; // successfully got response, exit retry loop
          } catch (err: any) {
            lastError = err;
            const errMsg = err.message || "";
            const isTransient = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || err.status === 503 || err.status === 429;
            
            if (isTransient && attempt < maxRetries) {
              attempt++;
              const delay = attempt * 500;
              console.warn(`Transient error calling ${modelName} (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${errMsg}`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              // Not transient or exceeded retries, break retry loop to try next model
              break;
            }
          }
        }

        if (success) {
          break; // successfully got response, exit models loop
        } else {
          console.warn(`Failed to generate content with ${modelName} after attempts. Trying next fallback model.`);
        }
      }

      if (lastError) {
        throw lastError;
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.warn("Gemini server-side API warning/handled:", error.message || error);
      res.status(500).json({ error: error.message || "Error calling Gemini API" });
    }
  });

  // Vite middleware for development / Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
