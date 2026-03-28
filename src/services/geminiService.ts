
import { GoogleGenAI } from "@google/genai";
import { AIMessage } from "../../types";

export interface FileData {
  data: string;
  mimeType: string;
}

/**
 * Fixed type error by using AIMessage[] for history.
 */
export const getAIResponse = async (history: AIMessage[], userInput: string, fileData?: FileData) => {
  try {
    // Initialize the Gemini API client using the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Construct the contents array from the provided conversation history
    // The history already includes the latest user message from the UI
    const contents: any[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }] as any[]
    }));
    
    // The Gemini API requires the first message in the contents array to have a 'user' role.
    // If the history starts with a 'model' greeting, we remove it to comply with this requirement.
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // If there is an uploaded file, we need to attach it to the LAST message (which is the user's latest prompt)
    if (fileData && contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType,
        },
      });
    }

    // Execute the content generation using the gemini-3-flash-preview model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "You are Proph AI, an expert academic assistant for Nigerian Federal University students. You excel at analyzing study documents, handouts, and textbooks. When provided with a document, you can explain it, summarize it, or generate highly relevant exam questions (MCQs, short answers, and essays) based on the Nigerian university curriculum standards. Be precise, academic, and encouraging.",
      }
    });

    // Extract and return the generated text content from the response object
    // Corrected to use the .text property as per guidelines
    return response.text || "I'm sorry, I couldn't process the request. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI. Please check your connection and the file format.";
  }
};
