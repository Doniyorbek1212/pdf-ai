
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * JSON matnini tozalash va ob'ektga o'tkazish
 */
const parseGeminiJSON = (text: string) => {
  try {
    const cleaned = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing error:", e);
    return null;
  }
};

export const generatePresentation = async (topic: string, slideCount: number, language: string) => {
  const prompt = `Mavzu: "${topic}". Til: ${language}. Slaydlar soni: ${slideCount}. 
  Professional taqdimot uchun slaydlar mazmunini JSON formatida qaytar. 
  Har bir slaydda sarlavha, 3-5 ta punktli matn va rasm uchun kalit so'z bo'lishi shart.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualKeyword: { type: Type.STRING },
                footer: { type: Type.STRING }
              },
              required: ["slideNumber", "title", "content", "visualKeyword", "footer"]
            }
          }
        },
        required: ["title", "slides"]
      }
    }
  });
  
  return parseGeminiJSON(response.text);
};

export const processPhotoAI = async (imageBuffer: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageBuffer, mimeType: 'image/png' } },
        { text: prompt + " Output MUST include the processed image as an inlineData part." }
      ]
    }
  });
  
  let resultImage = '';
  let resultText = response.text || '';
  
  // Rasm qismini qidirish
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        resultImage = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  return { text: resultText, imageUrl: resultImage };
};

export const chatWithDocumentStream = async (fileBase64: string, mimeType: string, userMessage: string, textContext?: string, onChunk?: (text: string) => void) => {
  const parts: any[] = [];
  if (textContext) parts.push({ text: `Hujjat matni:\n${textContext}` });
  else parts.push({ inlineData: { data: fileBase64, mimeType } });
  parts.push({ text: userMessage });

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });

  let fullText = "";
  for await (const chunk of responseStream) {
    if (chunk.text) {
      fullText += chunk.text;
      if (onChunk) onChunk(fullText);
    }
  }
  return fullText;
};

export const extractDocumentText = async (fileBase64: string, mimeType: string, preExtractedText?: string) => {
  const parts: any[] = [];
  if (preExtractedText) parts.push({ text: preExtractedText });
  else parts.push({ inlineData: { data: fileBase64, mimeType } });
  parts.push({ text: "Hujjatni tahlil qilib qisqacha konspekt ber." });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });
  return response.text;
};

export const generateArticle = async (topic: string, type: string, tone: string) => {
  const prompt = `Mavzu: "${topic}". Tur: ${type}. Ohang: ${tone}. HTML formatida maqola yoz.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });
  return response.text;
};

export const convertDocumentContent = async (fileBase64: string, mimeType: string, targetFormat: string, textContext?: string) => {
  const parts: any[] = [];
  if (textContext) parts.push({ text: textContext });
  else parts.push({ inlineData: { data: fileBase64, mimeType } });
  parts.push({ text: `Ushbu faylni ${targetFormat} formatiga moslashtirib qaytar.` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });
  return response.text;
};

export const generateTest = async (topic: string, count: number, fileBase64?: string, mimeType?: string) => {
  const parts: any[] = [];
  if (fileBase64 && mimeType) parts.push({ inlineData: { data: fileBase64, mimeType } });
  parts.push({ text: `Mavzu: "${topic}". ${count} ta test HTML formatida qaytar.` });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });
  return response.text;
};

export const chatWithDocument = async (fileBase64: string, mimeType: string, userMessage: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: fileBase64, mimeType } },
        { text: userMessage }
      ]
    }
  });
  return response.text;
};
