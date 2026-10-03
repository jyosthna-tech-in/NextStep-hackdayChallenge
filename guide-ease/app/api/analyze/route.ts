import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Explicitly pass the API key or paste your key string directly here for testing
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_ACTUAL_API_KEY_HERE' 
});

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, prompt, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const fullPrompt = `
      You are an accessibility assistant for public offices, hospitals, and transit hubs.
      Analyze the attached image (noticeboard, form, queue display, or token screen).
      User Query: "${prompt || 'What is happening and what should I do next?'}"
      Target Output Language: ${language}

      Provide your response in structured JSON format with the following keys:
      {
        "situationSummary": "A clear, simple explanation of what is currently happening or what this notice means.",
        "requiredDocuments": ["List of documents or items needed, if any"],
        "nextSteps": ["Step 1 description", "Step 2 description", "Step 3 description"]
      }
      Ensure the entire response text and explanation are fully translated into ${language}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
        fullPrompt,
      ],
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('Error analyzing image with Gemma 4:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze image' }, { status: 500 });
  }
}