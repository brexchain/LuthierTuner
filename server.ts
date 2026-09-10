import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please add it to Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Generate Image endpoint
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1' } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A prompt string is required' });
      }

      const ai = getAiClient();
      const modelsToTry = [
        'gemini-3.1-flash-image-preview',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
      ];
      let lastError: unknown = null;
      let imageUrl: string | null = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [{ text: prompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: (aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9') || '1:1',
              },
            },
          });

          const parts = response.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!imageUrl) {
        throw lastError || new Error('Failed to generate image from Gemini model');
      }

      res.json({ imageUrl });
    } catch (err: unknown) {
      console.error('Error generating image:', err);
      let message = err instanceof Error ? err.message : 'Failed to generate image';
      let statusCode = 500;
      let isQuota = false;

      if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('Quota exceeded')) {
        statusCode = 429;
        isQuota = true;
        message = 'Gemini API Quota Exceeded (429): Image generation requires an active paid quota tier or API key. Please select a paid key in Settings > Secrets or choose one of our handcrafted tonewood presets below.';
      }

      res.status(statusCode).json({ error: message, isQuota });
    }
  });

  // Edit Image endpoint
  app.post('/api/edit-image', async (req, res) => {
    try {
      const { base64Image, prompt } = req.body;
      if (!base64Image || !prompt) {
        return res.status(400).json({ error: 'base64Image and prompt are required' });
      }

      const ai = getAiClient();
      let mimeType = 'image/png';
      let rawBase64 = base64Image;

      if (base64Image.startsWith('data:')) {
        const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          rawBase64 = match[2];
        }
      }

      const modelsToTry = [
        'gemini-3.1-flash-image-preview',
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
      ];
      let lastError: unknown = null;
      let imageUrl: string | null = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: rawBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          });

          const parts = response.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!imageUrl) {
        throw lastError || new Error('Failed to edit image from Gemini model');
      }

      res.json({ imageUrl });
    } catch (err: unknown) {
      console.error('Error editing image:', err);
      let message = err instanceof Error ? err.message : 'Failed to edit image';
      let statusCode = 500;
      let isQuota = false;

      if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('Quota exceeded')) {
        statusCode = 429;
        isQuota = true;
        message = 'Gemini API Quota Exceeded (429): Image editing requires an active paid quota tier or API key. Please select a paid key in Settings > Secrets or choose one of our handcrafted tonewood presets below.';
      }

      res.status(statusCode).json({ error: message, isQuota });
    }
  });

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luthier server listening on port ${PORT}`);
  });
}

startServer();
