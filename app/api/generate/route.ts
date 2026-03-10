import { NextResponse } from 'next/server';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it to your environment variables.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();

    const openai = getOpenAIClient();

    let systemInstruction = "You are a helpful AI assistant that generates high-quality content.";
    
    if (type === 'note') {
      systemInstruction = "You are an expert note-taker. Generate structured, concise, and informative notes based on the user's topic. Use Markdown for formatting.";
    } else if (type === 'blog') {
      systemInstruction = "You are a professional blog writer. Create engaging, SEO-friendly blog posts with catchy titles, clear headings, and a compelling narrative. Use Markdown.";
    } else if (type === 'review') {
      systemInstruction = "You are a critical product reviewer. Provide balanced, detailed reviews covering pros, cons, and a final verdict. Use Markdown.";
    } else if (type === 'search') {
      systemInstruction = "You are a knowledge assistant. Provide a comprehensive summary and key facts about the searched topic. Use Markdown.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ content: response.choices[0].message.content });
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
