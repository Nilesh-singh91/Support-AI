import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, ownerId } = await req.json();

    if (!message || !ownerId) {
      return NextResponse.json(
        {
          message: "Message and owner ID are required.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          message: "Gemini API key is missing.",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    await connectDb();

    const settings = await Settings.findOne({ ownerId });

    if (!settings) {
      return NextResponse.json(
        {
          message: "Chatbot is not configured yet.",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const knowledge = `
Business Name: ${settings.businessName || "Not provided"}
Support Email: ${settings.supportEmail || "Not provided"}

Knowledge Base:
${settings.knowledge || "No knowledge provided"}
`;

    const prompt = `
You are a professional customer-support assistant.

Answer the customer's question using only the business information
provided below.

Rules:
- Do not invent policies, prices, delivery times, or promises.
- Keep the answer short, clear, and helpful.
- If the answer is unavailable, ask the customer to contact the support email.

BUSINESS INFORMATION:
${knowledge}

CUSTOMER QUESTION:
${message}
`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const answer = result.text?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          message: "No response was generated.",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        message: answer,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the answer.",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}