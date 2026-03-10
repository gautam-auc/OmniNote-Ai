import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { messages, systemInstruction } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ text: content });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while calling Groq API.' },
      { status: 500 }
    );
  }
}
