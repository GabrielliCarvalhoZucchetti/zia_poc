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

      const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
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

  // Helper to extract main text from HTML, removing headers, footers, navs, ads
  function extractMainContent(html: string): string {
    let content = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }

    // Remove scripts, styles, svgs
    content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    content = content.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, '');
    
    // Remove typical non-content containers
    content = content.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, '');
    content = content.replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, '');
    content = content.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, '');
    content = content.replace(/<aside[^>]*>([\s\S]*?)<\/aside>/gi, '');
    content = content.replace(/<form[^>]*>([\s\S]*?)<\/form>/gi, '');
    content = content.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '');
    
    // Remove comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Replace typical block closures or tags with spacing to maintain structure
    content = content.replace(/<\/p>/gi, '\n\n');
    content = content.replace(/<\/div>/gi, '\n');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<li>/gi, ' • ');
    content = content.replace(/<\/li>/gi, '\n');
    content = content.replace(/<h[1-6][^>]*>/gi, '\n\n');
    content = content.replace(/<\/h[1-6]>/gi, '\n');

    // Strip all HTML tags
    content = content.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    content = content
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/g, "'")
      .replace(/&atilde;/gi, 'ã')
      .replace(/&otilde;/gi, 'õ')
      .replace(/&ccedil;/gi, 'ç')
      .replace(/&aacute;/gi, 'á')
      .replace(/&eacute;/gi, 'é')
      .replace(/&iacute;/gi, 'í')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&acirc;/gi, 'â')
      .replace(/&ecirc;/gi, 'ê')
      .replace(/&ocirc;/gi, 'ô');

    // Clean up whitespace
    content = content.replace(/[ \t]+/g, ' ');
    content = content.replace(/\n\s*\n+/g, '\n\n');
    return content.trim();
  }

  // API Route: Web Crawler
  app.post("/api/crawl", async (req, res) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: "O parâmetro 'urls' é obrigatório e deve ser um array." });
      }

      const results = [];

      for (const url of urls) {
        if (!url || typeof url !== 'string') continue;
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: AbortSignal.timeout(10000) // 10s timeout per url
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();

          // Extract title
          const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : "Sem título";

          // Extract main content
          const content = extractMainContent(html);

          results.push({
            sourceUrl: url,
            title: title,
            content: content,
            status: "success"
          });
        } catch (error: any) {
          console.error(`Erro ao processar URL ${url}:`, error.message);
          results.push({
            sourceUrl: url,
            title: "Erro de Carregamento",
            content: `Falha ao processar URL: ${error.message || error}`,
            status: "error"
          });
        }
      }

      res.json({ results });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erro interno do servidor" });
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
