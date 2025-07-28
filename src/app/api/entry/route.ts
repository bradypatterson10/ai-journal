import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    console.log('🚀 Received entry:', content);

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Entry content is required' }, { status: 400 });
    }

    let summary = '';
    try {
      const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: `Summarize this journal entry in 1–2 sentences:\n\n${content}` },
        ],
        temperature: 0.7,
      });

      summary = chat.choices[0].message.content || '';
      console.log('🧠 Summary generated:', summary);
    } catch (openaiError) {
      console.error('❌ OpenAI error:', openaiError);
      summary = '(summary failed)';
    }

    const newEntry = await prisma.entry.create({
      data: { content, summary },
    });

    console.log('✅ Entry saved to DB:', newEntry);
    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('❌ Route POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📦 Returning entries:', entries.length);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('❌ Route GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
