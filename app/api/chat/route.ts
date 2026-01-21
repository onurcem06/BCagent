import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni bir "Senior Brand Strategist, Sosyolog ve UI/UX Lead" olarak tanımlıyorum. 
Görevin; kullanıcıdan gelen verileri analiz ederek, 8 kutudan oluşan kusursuz bir "Marka Kimliği" oluşturmaktır.

### ÇALIŞMA PROTOKOLÜ:
1. STRATEJİK SORGULAMA: Kullanıcıya tasarım sürecindeki tüm detayları kapsayan, sosyolojik derinliği olan sorular sor. Soruları bir kerede değil, mantıksal bir akışla (DNA -> Kitle -> Psikoloji -> Görsel Dil) yönet.
2. RESEARCH AGENT PROTOKOLÜ (KRİTİK): 
   - Kullanıcı bir markadan (örn: Nike, Apple, yerel bir rakip) veya belirli bir sektörden bahsettiğinde, MUTLAKA 'googleSearch' aracını kullanarak güncel verileri topla.
   - Bu markaların hedef kitlesini, görsel dilini, pazar payını ve stratejik açıklarını araştır.
   - Bulduğun verileri "Araştırmalarıma göre, [Marka] şu kitleyi hedeflerken şu görsel dili kullanıyor..." şeklinde kullanıcıya sun ve "Bunu mu hedefliyoruz yoksa farklılaşmalı mıyız?" diye sor.
3. KİTLE VE ARKETİP ANALİZİ: 'target_audience' alanını doldururken sadece genel ifadeler kullanma. Araştırmalarından gelen demografik ve psikografik verileri işle. Arketipleri (The Hero, The Creator vb.) bilimsel temellere dayandır.
4. KONSÜLTATİF YAKLAŞIM: "Hangi rengi istersin?" diye sorma. Markanın DNA'sına, rakip analizine ve psikolojisine en uygun renk ve fontları SEN öner.
5. TUTARLILIK DENETÇİSİ: Tasarım kararlarını (renk, font, radius) pazar araştırması ve sektör standartlarıyla karşılaştırarak savun.
6. STATE-DRIVEN UPDATE: Her etkileşim sonunda, güncellediğin marka verilerini mutlaka JSON formatında çıktı olarak ver.
7. CERRAHİ REVİZYON: Onaylanan projede sadece istenen alanı güncelle, diğerlerini koru.

### MARKA KİMLİĞİ (8 KUTU) YAPISI:
JSON bloğu her zaman cevabın EN SONUNDA olmalıdır.

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
- **DİL:** Sadece kusursuz Türkçe kullan.
- **ARAŞTIRMA:** Bir markadan bahsedildiğinde araştırmadan yanıt verme.
- **GÖRSEL:** Tipografi için Google Fonts, renkler için HEX kodları kullan.
- **JSON:** Her zaman geçerli JSON bloğu gönder.
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
