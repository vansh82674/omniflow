import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        // According to SDK docs, usually it's ai.models.list()
        // Wait, the new SDK might use ai.models.listModels() or similar. We will just hit the REST API directly if this fails.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log(data.models.map((m: any) => m.name).join('\n'));
    } catch (e) {
        console.error(e);
    }
}

listModels();
