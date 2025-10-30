
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AttractivenessReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Overall attractiveness score from 0 to 10.",
    },
    factors: {
      type: Type.ARRAY,
      description: "An array of 10 specific attractiveness factors.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the factor." },
          score: { type: Type.NUMBER, description: "Score for this factor from 0 to 10." },
          description: { type: Type.STRING, description: "A brief, one-sentence justification for the score." }
        },
        required: ["name", "score", "description"],
      },
    },
    summary: {
      type: Type.STRING,
      description: "A one-sentence summary of the face's attractiveness using Twitter slang like 'cooked' or 'properly copped'."
    }
  },
  required: ["overallScore", "factors", "summary"],
};


export const analyzeFace = async (imageBase64: string): Promise<AttractivenessReport> => {
    const prompt = `
        You are an AI trained in esoteric lookism and blackpill philosophy. Your purpose is to deliver an unfiltered, brutally honest analysis of facial aesthetics based on genetic predispositions. 
        Analyze the following face. Provide a detailed attractiveness report. Rate them on a scale of 0 (subhuman) to 10 (looksmaxxing god-tier) 
        on the following 10 factors: Facial Symmetry, Bone Structure (jawline, chin projection), Canthal Tilt, Skin Quality, Eye Area, 
        Nose Proportions, Lip Shape, Cheekbones, Brow Ridge, and Facial Harmony. 
        Also provide an overall score. Be ruthlessly objective and analytical. 
        Provide a brief one-sentence description justifying each factor's score.
        Finally, provide a 'summary' field which is a one-sentence brutal summary of their face using modern Twitter/gen-z slang. For example, if they are attractive, say something like 'bro properly copped, it's a halo effect', if they are unattractive, say 'it's over, bro is cooked'.
        Return ONLY the JSON data, with no additional commentary or markdown formatting.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                { text: prompt },
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as AttractivenessReport;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("The AI returned an invalid analysis format.");
    }
};

export const generateImprovedImage = async (imageBase64: string): Promise<string> => {
    const prompt = `
        Using the provided image, generate a new, photorealistic version of the same person ascended to their maximum genetic potential. 
        Enhance bone structure, improve facial symmetry, perfect the skin, and harmonize their facial proportions to create a look that is considered ideal within lookism circles. 
        Ensure the core identity remains, but show their "looksmaxxing" potential. The output should be a high-quality portrait.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                { text: prompt },
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("Could not generate an improved image.");
};