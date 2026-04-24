import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. OpenAI Setup (GPT-4o-mini ke liye)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    const questionText = formData.get('question');
    const keywords = formData.get('keywords');

    // --- STEP A: Audio to Text (Using Groq Whisper - FREE) ---
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile, 'answer.webm');
    groqFormData.append('model', 'whisper-large-v3');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqFormData,
    });
    
    const groqData = await groqRes.json();
    const transcript = groqData.text;

    // --- STEP B: Analysis (Using GPT-4o-mini - CHEAP) ---
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Sabse sasta aur fast model
      messages: [
        {
          role: "system",
          content: "You are an expert BPO interviewer. Analyze the candidate's answer based on the question and ideal keywords. Return ONLY a JSON object."
        },
        {
          role: "user",
          content: `Question: ${questionText}
                    Keywords: ${keywords}
                    Candidate's Answer: ${transcript}
                    
                    Return JSON format:
                    {
                      "accuracy": score 0-100,
                      "fluency": score 0-100,
                      "tone": "Professional/Neutral/Informal",
                      "feedback": "Short 1-line feedback"
                    }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');

    // Final Response bhejna
    return NextResponse.json({
      transcript,
      ...aiResult
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}