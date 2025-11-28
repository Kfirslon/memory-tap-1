
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult, MemoryCategory, Memory } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const processAudioMemory = async (audioBlob: Blob): Promise<ProcessingResult> => {
  const ai = getAIClient();
  const base64Audio = await blobToBase64(audioBlob);

  const prompt = `
    You are an intelligent personal assistant backend. 
    Analyze the provided audio. 
    1. Transcribe the audio exactly.
    2. Summarize the content concisely (max 2 sentences).
    3. Generate a short, catchy title (max 5 words).
    4. Categorize the content into one of these buckets: 'task', 'reminder', 'idea', 'note'.
    
    Return the result strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/webm",
              data: base64Audio,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            summary: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ['task', 'reminder', 'idea', 'note'] 
            }
          },
          required: ["transcription", "summary", "title", "category"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");

    const parsedData = JSON.parse(resultText);
    
    return {
      transcription: parsedData.transcription,
      summary: parsedData.summary,
      title: parsedData.title,
      category: parsedData.category as MemoryCategory,
    };
  } catch (error) {
    console.error("Gemini Processing Error:", error);
    throw new Error("Failed to process audio memory.");
  }
};

export const generateBriefing = async (memories: Memory[]): Promise<{ priorityIds: string[], analysis: string }> => {
    const ai = getAIClient();
    
    // optimize context window by only sending relevant text
    const context = memories.map(m => `ID: ${m.id} | Category: ${m.category} | Title: ${m.title} | Content: ${m.summary} | Completed: ${m.isCompleted}`).join('\n');

    const prompt = `
        Analyze these recent user memories.
        1. Identify the top 3 most urgent/important UNCOMPLETED items (Tasks or Reminders) that the user should complete first. Return their IDs.
        2. Write a friendly, motivational daily briefing paragraph (max 50 words) summarizing what's on their plate and encouraging them.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${prompt}\n\nMemories:\n${context}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priorityIds: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        analysis: { type: Type.STRING }
                    },
                    required: ["priorityIds", "analysis"]
                }
            }
        });
        
        const text = response.text;
        if (!text) return { priorityIds: [], analysis: "Could not generate briefing." };
        return JSON.parse(text);
    } catch (e) {
        console.error("Briefing error", e);
        return { priorityIds: [], analysis: "Unable to generate insights at this time." };
    }
}

export const generateHabitAnalysis = async (memories: Memory[]): Promise<{ pattern: string, suggestion: string, productivityScore: number }> => {
    const ai = getAIClient();
    
    const context = memories.map(m => `Category: ${m.category} | Created: ${m.createdAt} | Title: ${m.title} | Completed: ${m.isCompleted}`).join('\n');

    const prompt = `
        You are a premium productivity coach. Analyze the user's memory log.
        1. Identify a pattern in their habits (e.g., "You capture most ideas in the morning").
        2. Provide one actionable suggestion to improve their workflow.
        3. Give a productivity score from 1-100 based on task capture and completion balance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${prompt}\n\nData:\n${context}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pattern: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                        productivityScore: { type: Type.INTEGER }
                    },
                    required: ["pattern", "suggestion", "productivityScore"]
                }
            }
        });

        const text = response.text;
        if (!text) return { pattern: "Analysis failed", suggestion: "Try again later", productivityScore: 0 };
        return JSON.parse(text);
    } catch (e) {
         return { pattern: "Analysis unavailable", suggestion: "Check back later.", productivityScore: 50 };
    }
}
