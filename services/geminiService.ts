
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

// Service to generate creative zone details based on coordinates using Google GenAI SDK.
export const generateZoneDetails = async (
  lat: number,
  lng: number
): Promise<GeminiResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  // Always use a named parameter when initializing the GoogleGenAI client.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Basic Text Tasks should use the 'gemini-3-flash-preview' model.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a creative, short name and a 1-sentence vibe description for a location music zone at coordinates: ${lat}, ${lng}. Assume it's a generic urban area if specific data is missing.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedName: {
              type: Type.STRING,
              description: "A short, catchy name for the location",
            },
            description: {
              type: Type.STRING,
              description: "A very short description of the vibe",
            },
          },
          required: ["suggestedName", "description"],
        },
      },
    });

    // Directly access the text property; do not invoke it as a function.
    if (response.text) {
      return JSON.parse(response.text) as GeminiResponse;
    }
    
    return {
      suggestedName: "New Zone",
      description: "A custom music zone",
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      suggestedName: "My Location",
      description: "Manually added location",
    };
  }
};
