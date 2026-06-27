import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Client as WaveSpeed } from "wavespeed";

dotenv.config();

// Initialize Google GenAI SDK with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY || "";
const wavespeed = new WaveSpeed(WAVESPEED_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set large limits for base64 image payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: WaveSpeed AI Virtual Try-On (Nano Banana — AI Clothes Changer)
  app.post("/api/wavespeed/tryon", async (req, res) => {
    try {
      const { person_image, clothing_image, wavespeed_api_key } = req.body;

      if (!person_image || !clothing_image) {
        return res.status(400).json({
          error: "Both person_image and clothing_image are required",
        });
      }

      const activeApiKey = wavespeed_api_key || WAVESPEED_API_KEY;

      if (!activeApiKey) {
        return res.status(400).json({
          error: "WaveSpeed API key is missing. Please configure it in your environment or set it in the App Settings UI.",
        });
      }

      const prompt = "Change the clothes of the person in the first image to wear the customized polo shirt shown in the second image. Fit it naturally on their body, adjusting to their posture and lighting.";

      // Initialize the WaveSpeed SDK client with the active key
      const wavespeedClient = new WaveSpeed(activeApiKey);

      // Run the try-on model using the official WaveSpeed SDK client
      const result = await wavespeedClient.run("openai/gpt-image-2/edit", {
        enable_base64_output: false,
        enable_sync_mode: false,
        images: [person_image, clothing_image],
        output_format: "png",
        prompt: prompt,
        quality: "medium",
        resolution: "1k"
      });

      const outputUrl = result.outputs?.[0] || result.output?.[0] || result.output;

      if (!outputUrl) {
        return res.status(500).json({
          error: "Failed to generate try-on result from WaveSpeed",
          raw: result,
        });
      }

      return res.json({
        status: "completed",
        output: outputUrl,
      });
    } catch (err: any) {
      console.error("WaveSpeed try-on error:", err);
      res.status(500).json({ error: "Try-on failed", details: err.message });
    }
  });

  // API Route: Gemini AI T-Shirt Layout Analyst
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { mockupImageBase64, tShirtColor, logoName } = req.body;

      if (!mockupImageBase64) {
        return res.status(400).json({ error: "Missing mockup image data for analysis" });
      }

      // Standardize base64 for Gemini API
      const base64Data = mockupImageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      };

      const promptPart = {
        text: `You are an expert fashion branding and merchandise design analyst.
Analyze this high-fidelity polo T-shirt try-on mockup design.
T-Shirt Color: ${tShirtColor || "Unspecified"}
Logo Details: ${logoName || "Custom Logo"}

Please inspect the logo overlay on the left side of the t-shirt chest and provide a structured JSON response evaluating the following criteria:
1. "placementRating": A score from 1 to 10 for chest alignment and positioning.
2. "contrastRating": A score from 1 to 10 for visibility of the logo against the shirt color.
3. "aestheticScore": A score from 1 to 10 for overall look, balance, and visual appeal.
4. "feedback": A brief paragraph summarizing how realistic, stylish, and professional the mockup looks.
5. "suggestions": A list of 3 actionable design tips (e.g., resizing, opacity, slight color adjustment, or repositioning) to make it look even more premium.
6. "brandTheme": A short description of the "vibe" or style this combination conveys (e.g. "Corporate Uniform", "Minimalist Streetwear", "Athletic Sportswear").

Ensure you return ONLY valid JSON matching this schema:
{
  "placementRating": number,
  "contrastRating": number,
  "aestheticScore": number,
  "feedback": string,
  "suggestions": string[],
  "brandTheme": string
}
Do not include any Markdown blocks (like \`\`\`json) in your final response. Just the raw JSON string.`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [imagePart, promptPart],
      });

      const responseText = response.text || "{}";
      
      // Clean up markdown block styling if returned
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const analysis = JSON.parse(cleanedText);

      res.json(analysis);
    } catch (err: any) {
      console.error("Gemini analysis error:", err);
      res.status(500).json({ error: "Gemini analysis failed", details: err.message });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
