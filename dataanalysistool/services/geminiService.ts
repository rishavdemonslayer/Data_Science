import { GoogleGenAI } from "@google/genai";
import { Dataset, CaseStudyProject } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is missing from environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateDataInsights = async (dataset: Dataset, query: string): Promise<string> => {
  const ai = getClient();

  // Create a concise context for the model
  const summaryContext = JSON.stringify(dataset.summary.map(c => ({
    column: c.name,
    type: c.type,
    mean: c.mean?.toFixed(2),
    max: c.max,
    topValues: c.topValues?.slice(0, 3)
  })), null, 2);

  const rowSample = JSON.stringify(dataset.rows.slice(0, 5), null, 2);

  const prompt = `
    You are a senior Data Analyst. 
    I have a dataset named "${dataset.name}".
    
    Here is the statistical summary of the columns:
    ${summaryContext}

    Here are the first 5 rows of raw data for context:
    ${rowSample}

    User Query: "${query}"

    Analyze the data based on the summary provided. 
    If the user asks for code, provide Python (pandas) or R code snippets.
    If the user asks for insights, look for trends in the summary statistics.
    Keep your response professional, concise, and formatted in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No insights could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating insights. Please check your API key or try again later.";
  }
};

export const generateCaseStudy = async (dataset: Dataset): Promise<Partial<CaseStudyProject>> => {
    const ai = getClient();

    const summaryContext = JSON.stringify(dataset.summary.map(c => ({
        column: c.name,
        type: c.type,
        mean: c.mean,
        topValues: c.topValues?.slice(0, 3)
    })), null, 2);

    const prompt = `
      You are an expert Data Scientist building a portfolio case study.
      I have a dataset named "${dataset.name}".
      
      Dataset Summary:
      ${summaryContext}

      Generate a professional case study draft in JSON format with the following keys:
      - title: A catchy professional title for the analysis.
      - objective: A clear business or analytical objective based on the data columns.
      - methodology: Describe standard EDA steps, data cleaning (mention checking for missing values), and potential visualization techniques suitable for this data.
      - findings: Generate 3 hypothetical but plausible key insights based on the variable names and types provided.
      - conclusion: A summary recommendation.

      Return ONLY valid JSON. Do not use Markdown code blocks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const text = response.text;
        if (!text) return {};
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error (Case Study):", error);
        return {
            title: "Analysis of " + dataset.name,
            objective: "To analyze trends and patterns within the provided dataset.",
            methodology: "Data cleaning, statistical summary, and visual analysis.",
            findings: "Error generating AI findings.",
            conclusion: "Further analysis recommended."
        };
    }
};