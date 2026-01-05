import { Router } from 'express';
import { createClient } from '@deepgram/sdk';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const GOAL_AREAS = [
  { id: 'physical_health', name: 'Physical Health', keywords: ['exercise', 'workout', 'gym', 'run', 'peloton', 'yoga', 'walk', 'swim', 'bike', 'strength', 'cardio', 'stretch'] },
  { id: 'mental_health', name: 'Mental Health', keywords: ['meditat', 'journal', 'therapy', 'mindful', 'breathing', 'gratitude', 'read', 'relax', 'sleep', 'self-care'] },
  { id: 'family_ian', name: 'Family: Ian', keywords: ['ian', 'son', 'kid', 'child', 'play', 'homework', 'school', 'teach', 'bedtime', 'breakfast'] },
  { id: 'family_wife', name: 'Family: Wife', keywords: ['wife', 'spouse', 'partner', 'date', 'dinner together', 'connect', 'talk', 'listen', 'support', 'love'] },
  { id: 'work_strategic', name: 'Work: Strategic', keywords: ['strategy', 'okr', 'vision', 'presentation', 'roadmap', 'planning', 'decision', 'meeting', 'project', 'initiative'] },
  { id: 'work_leadership', name: 'Work: Leadership', keywords: ['1:1', 'one on one', 'team', 'mentor', 'feedback', 'coaching', 'hire', 'review', 'delegate', 'empower'] },
  { id: 'content_newsletter', name: 'Content: Newsletter', keywords: ['newsletter', 'wrote', 'article', 'content', 'blog', 'post', 'draft', 'publish', 'write', 'edit'] },
];

async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey) {
    throw new Error('DEEPGRAM_API_KEY not configured');
  }

  const deepgram = createClient(deepgramKey);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
      utterances: true,
    }
  );

  if (error) throw error;

  const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
  return transcript;
}

interface ExtractedWin {
  title: string;
  goalAreaId: string;
  goalAreaName: string;
  confidence: number;
}

async function extractWins(transcript: string): Promise<ExtractedWin[]> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return fallbackExtraction(transcript);
  }

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const goalAreasContext = GOAL_AREAS.map(g => `- ${g.id}: ${g.name}`).join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a helpful assistant that extracts personal wins/accomplishments from voice transcripts.

Goal Areas:
${goalAreasContext}

Transcript: "${transcript}"

Extract any wins/accomplishments mentioned. For each win:
1. Create a concise title (under 50 chars)
2. Assign to the most appropriate goal area
3. Rate confidence 0-1 based on how clearly it matches

Respond in JSON format:
{
  "wins": [
    { "title": "...", "goalAreaId": "...", "goalAreaName": "...", "confidence": 0.0 }
  ]
}

If no clear wins are found, return {"wins": []}.
Only extract actual accomplishments, not intentions or plans.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return fallbackExtraction(transcript);
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackExtraction(transcript);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.wins || [];
  } catch (err) {
    console.error('Claude extraction failed:', err);
    return fallbackExtraction(transcript);
  }
}

function fallbackExtraction(transcript: string): ExtractedWin[] {
  const lower = transcript.toLowerCase();

  for (const area of GOAL_AREAS) {
    for (const keyword of area.keywords) {
      if (lower.includes(keyword)) {
        return [{
          title: transcript.length > 50 ? transcript.slice(0, 47) + '...' : transcript,
          goalAreaId: area.id,
          goalAreaName: area.name,
          confidence: 0.7,
        }];
      }
    }
  }

  return [{
    title: transcript.length > 50 ? transcript.slice(0, 47) + '...' : transcript,
    goalAreaId: 'work_strategic',
    goalAreaName: 'Work: Strategic',
    confidence: 0.5,
  }];
}

router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No audio file provided' });
    }

    const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);

    if (!transcript.trim()) {
      return res.json({ success: true, data: { transcript: '', wins: [] } });
    }

    const wins = await extractWins(transcript);

    res.json({
      success: true,
      data: {
        transcript,
        wins,
      },
    });
  } catch (err) {
    console.error('Voice processing error:', err);
    const message = err instanceof Error ? err.message : 'Voice processing failed';
    res.json({ success: false, error: message });
  }
});

router.post('/transcribe-only', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No audio file provided' });
    }

    const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      data: { transcript },
    });
  } catch (err) {
    console.error('Transcription error:', err);
    const message = err instanceof Error ? err.message : 'Transcription failed';
    res.json({ success: false, error: message });
  }
});

export default router;
