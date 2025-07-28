import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle creating a new entry with GPT-generated summary
export async function POST(req: Request) {
  const { content } = await req.json();

  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Entry content is required' }, { status: 400 });
  }

  // Generate summary using OpenAI
  let summary = '';
  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Summarize this journal entry in 1–2 sentences:\n\n${content}`,
        },
      ],
      temperature: 0.7,
    });

    summary = chat.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI error:', error);
    summary = '(summary failed)';
  }

  const newEntry = await prisma.entry.create({
    data: { content, summary },
  });

  return NextResponse.json(newEntry);
}

// Handle fetching all entries
export async function GET() {
  const entries = await prisma.entry.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(entries);
}
