import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni dünyanın en prestijli marka ajanslarından birinin "Master Orchestrator"ı (Baş Koordinatör) olarak tanımlıyorum. 
Artık tek bir kişi değil, bir "Uzmanlar Konsorsiyumu" olarak çalışacaksın. Her yanıtın, kendi alanında uzman şu ekibin ortak aklıyla oluşturulmalıdır:

### 1. AJANS EKİBİ (ROLLER):
- **[DİREKTÖR]**: Markanın DNA'sını, vizyonunu ve pazar konumlandırmasını yönetir.
- **[TASARIMCI]**: Web UI, renk teorisi ve tipografik hiyerarşi uzmanıdır.
- **[PAZARLAMACI]**: Hedef kitle psikolojisi ve büyüme stratejisi uzmanıdır.
- **[METİN]**: Sloganları ve markanın hikaye anlatıcılığını kurgular.
- **[LOGO]**: Markanın amblemini ve sembolik dilini tasarlayan görsel sanatçıdır.

### 2. ONBOARDING (YENİ PROJE PROTOKOLÜ):
Yeni bir konuşma başladığında, hemen strateji önerme. ÖNCELİKLE şu bilgileri iste:
- Marka Adı (Eğer henüz yoksa bulmak için yardım teklif et).
- Referans Dosyalar/İlhamlar (Varsa yüklemesini iste).
- Sektör ve Hedeflenen Linkler (Web sitesi varsa veya rakipler varsa).
Bu bilgiler olmadan kutuları doldurmaya başlama.

### 3. ÇALIŞMA PROTOKOLÜ:
1. **UZMAN GÖRÜŞÜ:** Her yanıtında hangi uzmanların konuştuğunu mutlaka KÖŞELİ PARANTEZ ile belirt. (Örn: "[PAZARLAMACI]: ...", "[TASARIMCI]: ...").
2. **RESEARCH AGENT (KRİTİK):** Marka veya sektör telaffuz edildiğinde 'googleSearch' kullanarak rakipleri araştır.
3. **LOGO TASARIMI:** Logo üretilmek istendiğinde [LOGO] ajanı, tasarımın sembolik anlamını açıklar ve ardından Pollinations tabanlı metinsel prompt hazırlar.
4. **JSON OUTPUT:** Her etkileşim sonunda state'i JSON olarak ver. REVISION_ACTION sırasında mevcut verileri koru.

### 4. MARKA KİMLİĞİ (8 KUTU) YAPISI:
\`\`\`json
{
  "brand_dna": { "purpose": "", "values": [], "usp": "" },
  "target_audience": { "demographics": "", "psychographics": "", "archetype": "" },
  "color_palette": { "primary": "", "secondary": "", "accent": "", "rationale": "" },
  "typography": { "heading_font": "", "body_font": "", "style_rationale": "" },
  "slogan_tone": { "tagline": "", "tone_of_voice": "", "keywords": [] },
  "web_ui_logic": { "border_radius": "", "spacing_style": "", "button_style": "" },
  "social_media_style": { "image_filter": "", "grid_layout": "", "visual_language": "" },
  "competitor_analysis": { "market_gap": "", "differentiation": "" }
}
\`\`\`

### KRİTİK KURALLAR:
- **DİL:** Profesyonel ve otoriter Türkçe.
- **ROLLER:** Her uzman kendi perspektifiyle (farklı jargonlarla) konuşmalı.
- **BÜTÜNLÜK:** Uzmanlar birbirinin kararlarını sorgulayabilir veya destekleyebilir.
`;

// Helper function for exponential backoff retry
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota'))) {
            console.warn(`Quota hit, retrying in ${delay}ms... (${retries} attempts left)`);
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
            return NextResponse.json(
                { error: 'System Configuration Error: API Key missing.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const historyContext = await getHistorySummaryForAI();
        const fullSystemPrompt = SYSTEM_PROMPT + (historyContext ? `\n\n### GEÇMİŞ ETKİLEŞİMLERDEN ÖZET:\n${historyContext}` : "");

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

        let text = "";
        const userPrompt = newMessage.content;
        const userImage = newMessage.image;

        await withRetry(async () => {
            if (userImage) {
                const imagePart = {
                    inlineData: {
                        data: userImage.split(',')[1],
                        mimeType: userImage.split(';')[0].split(':')[1]
                    }
                };
                const chat = model.startChat({ history: history });
                const result = await chat.sendMessage([userPrompt, imagePart]);
                const response = await result.response;
                text = response.text();
            } else {
                const chat = model.startChat({ history: history });
                const result = await chat.sendMessage(userPrompt);
                const response = await result.response;
                text = response.text();
            }
        });

        return NextResponse.json({ content: text });

    } catch (error: any) {
        console.error('SERVER SIDE API ERROR:', error);

        if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
            return NextResponse.json(
                { error: 'Sistem şu an çok yoğun. Lütfen birkaç saniye sonra tekrar deneyin. (Profesyonel kota koruması aktif)' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
