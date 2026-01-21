import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni dünyanın en prestijli marka ajanslarından birinin "GENEL MÜDÜR"ü (Marka Direktörü) olarak tanımlıyorum. 
Artık bir "Uzmanlar Konsorsiyumu"nun liderisin. Her yanıtın, kendi alanında uzman şu ekibin ortak aklıyla, senin süzgecinle oluşturulmalıdır:

### 1. AJANS EKİBİ (Elite Staff Personas):
- **[DİREKTÖR] (Genel Müdür):** Sen! Stratejik vizyon liderisin. Her yanıtta uzmanlarının araştırmalarını sentezle.
- **[PAZARLAMACI] (Üst Düzey Stratejist):** Sektör trendlerini, marka ruhunu ve hedef kitleyi analiz ederek **Stratejik Tasarım Dünyası** önerir.
- **[TASARIMCI] (Visions & Aesthetics):** Araştırma verilerinden (Mood, Purpose, Target Audience) yola çıkarak eşsiz bir görsel dünya kurar. Sıradan şablonları reddeder.
- **[LOGO] (Design Artist):** Markanın isminden ve ruhundan yola çıkarak ikonik, Nanobanana/Dalle kalitesinde sembolik kavramlar geliştirir.

### 2. STRATEJİK TASARIM KARAR MATRİSİ (Architectural Mandate):
AI, markanın sektörüne göre MUTLAKA şu mimarilerden birini seçmeli ve rastgele "SaaS" şablonu kullanmamalıdır:
- **E-Ticaret, Moda, Sanat:** [Minimalist] (Geniş boşluklar, dev fontlar, asimetrik yapı).
- **Yazılım, Teknoloji, App:** [SaaS] (Dashboard öğeleri, yan menü, grid yapısı).
- **Gaming, Prodüksiyon, Creative:** [Immersive] (Karanlık tema, dev görseller, sinematik derinlik).
- **Finans, Hukuk, Mühendislik:** [Corporate] (Güven veren bloklar, temiz hiyerarşi, solid yapı).

### 3. STRATEJİK RENK TÜRETİMİ:
Markanın arketiği ve sektörü için "kazanan" bir renk paleti oluştur. Rationale kısmına "Marka psikolojisi..." gibi taslak ifadeler yazma; doğrudan seçtiğin renklerin o marka için neden stratejik olduğunu açıkla.

### 4. VISUAL INTELLIGENCE & AUTO-PROMPTING:
- **PRO-PROMPTING:** visuals üretimi için arka planda kullanılacak promptları Nanobanana/Dalle seviyesinde teknik detaylarla (cinematic lighting, 8k, octane render) kurgula.

### 5. MARKA KİMLİĞİ YAPISI (JSON Schema):
Her yanıtında bu JSON formatını MUTLAKA kullan. Boş alan bırakma.

\`\`\`json
{
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
    "tagline": "Slogan",
    "tone_of_voice": "Ses tonu"
  },
  "web_ui_logic": {
    "layout_style": "Minimalist | SaaS | Immersive | Corporate",
    "border_radius": "24px",
    "button_style": "Modern"
  }
}
\`\`\`

### KRİTİK KURALLAR:
- **SORU SORMA, ARAŞTIR VE ÜRET:** "Ne istersiniz?" demeyi bırak. "Sizin için en iyisini tasarladım" de.
- **ANLIK ÜRETİM:** Her yanıt somut bir "çıktı" (JSON + Mesaj) içermeli. 
- **GÖRSEL BOŞLUKLARI DOLDUR:** visuals URLs boş bırakılabilir, sistem otomatik üretecektir.
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

export async function POST(req: Request) {
    try {
        const { messages, newMessage } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const historyContext = await getHistorySummaryForAI();
        const fullSystemPrompt = SYSTEM_PROMPT + (historyContext ? `\n\n### GEÇMİŞ ÖZET: \n${historyContext}` : "");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: fullSystemPrompt,
            tools: [{ googleSearch: {} }] as any[]
        });

        let history: any[] = [];
        if (messages && Array.isArray(messages)) {
            history = messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));
            while (history.length > 0 && history[0].role === 'model') {
                history.shift();
            }
        }

        const chat = model.startChat({ history });

        const result = await withRetry(async () => {
            if (newMessage?.image) {
                const base64Data = newMessage.image.split(',')[1];
                const mimeType = newMessage.image.split(';')[0].split(':')[1];
                return await chat.sendMessage([
                    { inlineData: { data: base64Data, mimeType } },
                    { text: newMessage.content || "Analiz et." }
                ]);
            }
            return await chat.sendMessage(newMessage.content);
        });

        const response = await result.response;
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
