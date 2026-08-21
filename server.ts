import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Lazy init Gemini AI
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Image analysis endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided.' });
      }

      const ai = getAI();

      // Clean base64 data and get mime type
      const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const prompt = `You are an expert, encouraging Chinese language tutor analyzing a photo of Chinese study material with user-drawn highlighter annotations.

There are 2 highlighter colors used:
1. Warm Coral / Orange or Yellow: Highlights for NEW VOCABULARY WORDS.
2. Soft Azure / Blue or Purple: Highlights for GRAMMAR PATTERNS / SENTENCE STRUCTURES.

Carefully inspect the image and transcribe each highlighted word or phrase accurately. Provide an easy-to-read, structured Markdown response following these exact rules:

## 📖 New Vocabulary (Highlighted Words)
For each highlighted vocabulary word:
- **Chinese Characters** (with Pinyin)
- **Translation**
- **Formality**: ONLY include this bullet point if the word is formal or literary. If it is formal, also provide casual alternatives. DO NOT include this bullet point if the word is already casual/everyday.
- **Chengyu**: ONLY include this bullet point if the word is a 4-character idiom (成语 / Chengyu). If it is a Chengyu, break it down character-by-character and briefly explain its cultural meaning in 1-2 sentences. DO NOT include this bullet point if it is not a Chengyu.

---

## 🧩 Grammar Breakdown (Highlighted Sentences / Parts)
For each highlighted grammar section:
- **Target Phrase / Structure**: Write out the Chinese characters and Pinyin.
- **Literal & Natural Meaning**: What it means in context.
- **Structural Breakdown**: Break down the sentence part by part (Subject, Time/Place, Adverbial, Verb, Complement, Particles like 了, 着, 过, 把, 被, etc.).
- **Word Order Logic**: Clearly explain *why* words are in this specific order according to Chinese syntax rules.
- **Example Sentences**: Give 2 practical, easy-to-understand example sentences demonstrating this grammar pattern with Pinyin and English translation.

CRITICAL INSTRUCTION: DO NOT output any introductory text, greetings, conversational filler, or concluding remarks. Your response MUST consist ONLY of the "## 📖 New Vocabulary (Highlighted Words)" and "## 🧩 Grammar Breakdown (Highlighted Sentences / Parts)" sections. If no specific words or grammar were detected, just provide the transcription under these headings without any preamble. Format everything clearly with clean Markdown headings, bullet points, and bold text for optimal readability in a student copybook note-taking workflow.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: error?.message || 'Failed to analyze the image.' });
    }
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
