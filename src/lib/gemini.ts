import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';

export async function extractQuizFromDocument(base64Data: string, mimeType: string): Promise<Quiz> {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const systemInstruction = `You are an expert OCR and Educational Content Creator. Your task is to look at the provided document (image or PDF), extract all visible multiple-choice questions (MCQs), and convert them into a strict JSON format.
Rules:
Detect language automatically (support both English and Bengali).
If the document contains handwritten or printed text, transcribe it accurately.
For every question, identify 4 options and determine the correct answer.
Output Format must be ONLY a valid JSON array. Do not include any conversational text, explanations, or markdown formatting outside the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: "Extract the MCQs from this document into the specified JSON format.",
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4,
              },
              answer: { type: Type.STRING },
            },
            required: ["question", "options", "answer"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as Quiz;
  } catch (error) {
    console.error("Error extracting quiz:", error);
    throw error;
  }
}
