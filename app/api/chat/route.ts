import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';
import { AGENT_PROMPTS } from '@/app/lib/agent-prompts';

export const dynamic = 'force-dynamic';

const MODEL_NAME = "gemini-2.0-flash"; // Şu anki en hızlı ve yetenekli model

// Frontend'in beklediği JSON yapısı
const JSON_SCHEMA = `
{
  "brand_name": "Markanın gerçek ismi",
  "brand_dna": {
    "purpose": "Analiz sonucu amaç",
    "values": ["Değer 1", "Değer 2"],
    "usp": "Eşsiz satış vaadi"
  },
  "target_audience": {
    "demographics": "Hedef kitle",
    "psychographics": "Psikografik analiz",
    "archetype": "Marka arketiği"
  },
  "color_palette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "rationale": "Stratejik neden (Gerçek analiz)"
  },
  "typography": {
    "heading_font": "Google Font",
    "body_font": "Google Font",
    "style_rationale": "Tipografik uyum"
  },
  "slogan_tone": {
    "tagline": "Markanın mottosu (İsmini buraya yazma!)",
    "tone_of_voice": "Ses tonu"
  },
  "web_ui_logic": {
    "layout_style": "Minimalist | Immersive | Corporate | SaaS",
    "border_radius": "px değeri (örn: 12px)"
  },
  "competitor_analysis": {
    "market_gap": "Pazar boşluğu analizi",
    "differentiation": "Farklılaşma stratejisi"
  }
}
`;

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

async function runAgent(apiKey: string, systemPrompt: string, userContent: string, imageName?: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: systemPrompt });

    return await withRetry(async () => {
        if (imageName) { // Image processing if needed for specialized agents
            // Not implemented for sub-agents to save tokens unless critical
            return (await model.generateContent(userContent)).response.text();
        }
        return (await model.generateContent(userContent)).response.text();
    });
}

export async function POST(req: Request) {
    try {
        const { messages, newMessage } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const lastUserMessage = newMessage.content;

        // 1. AŞAMA: PARALEL UZMAN ANALİZİ (Multi-Agent Thinking)
        // Anahtar kelime veya görsel analizi için alt ajanları tetikliyoruz.
        console.log("--- MULTI-AGENT ANALİZ BAŞLIYOR ---");

        const [sociologistReport, psychologistReport, strategistReport] = await Promise.all([
            runAgent(apiKey, AGENT_PROMPTS.SOCIOLOGIST, `Analiz et: ${lastUserMessage}`),
            runAgent(apiKey, AGENT_PROMPTS.PSYCHOLOGIST, `Analiz et: ${lastUserMessage}`),
            runAgent(apiKey, AGENT_PROMPTS.STRATEGIST, `Analiz et: ${lastUserMessage}`)
        ]);

        console.log("--- UZMAN RAPORLARI HAZIR ---");

        // 2. AŞAMA: SAVAŞ ODASI (WAR ROOM) TOPLANTISI
        // Uzman raporlarını Direktör için birleştiriyoruz.
        const warRoomContext = `
GÖREV: Aşağıdaki kullanıcı talebi için uzman ekipten gelen raporları sentezle ve nihai stratejiyi belirle.

KULLANICI TALEBİ: "${lastUserMessage}"

--- UZMAN RAPORLARI ---
[SOSYOLOG RAPORU]:
${sociologistReport}

[PSİKOLOG RAPORU]:
${psychologistReport}

[STRATEJİST RAPORU]:
${strategistReport}

--- TALİMAT ---
Bu raporları kullanarak, markanın kimliğini oluştur. Çelişkili öneriler varsa Stratejist'in (Pazar odaklı) önerisine öncelik ver ama Sosyolog'un kültürel uyarılarını asla göz ardı etme.
Nihai çıktıyı mutlaka aşağıdaki JSON formatında ve açıklama metniyle birlikte üret.
`;

        // 3. AŞAMA: DİREKTÖRÜN KARARI (Final Synthesis)
        const historyContext = await getHistorySummaryForAI();
        const mainSystemPrompt = `
${AGENT_PROMPTS.DIRECTOR}

### KESİN ÇIKTI FORMATI (JSON):
Yanıtının sonunda (veya uygun yerinde) BU JSON ŞEMASINI KULLANARAK bir kod bloğu oluştur:
\`\`\`json
${JSON_SCHEMA}
\`\`\`

### UNUTMA:
- Sen bir yapay zeka değilsin, bir ajans başkanısın.
- Uzmanlarının (Sosyolog, Psikolog, Stratejist) verdiği aklı kullan ama kararı sen ver.
- Kullanıcıya rapor verirken "Ekibimizle yaptığımız toplantıda sosyologumuz şuna dikkat çekti..." gibi ifadeler kullan. Bu yaşayan bir şirket hissi verir.
${historyContext ? `\n### GEÇMİŞ BİLGİ:\n${historyContext}` : ""}
`;

        // Direktör için chat oturumu başlatıyoruz (Geçmişi hatırlaması için)
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: mainSystemPrompt
        });

        // Chat geçmişini düzenle (Sadece son birkaç mesajı tutmak yeterli olabilir, ama bağlam için hepsini veriyoruz)
        let history: any[] = [];
        if (messages && Array.isArray(messages)) {
            history = messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));
            // Model role ile başlayamaz kuralı için temizlik
            while (history.length > 0 && history[0].role === 'model') {
                history.shift();
            }
        }

        const chat = model.startChat({ history });

        // Direktöre "Image" yeteneği de ekleyelim
        const result = await withRetry(async () => {
            if (newMessage?.image) {
                const base64Data = newMessage.image.split(',')[1];
                const mimeType = newMessage.image.split(';')[0].split(':')[1];
                return await chat.sendMessage([
                    { inlineData: { data: base64Data, mimeType } },
                    { text: warRoomContext } // Görüntüyle birlikte analiz raporlarını da veriyoruz
                ]);
            }
            return await chat.sendMessage(warRoomContext);
        });

        const response = await result.response;
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
