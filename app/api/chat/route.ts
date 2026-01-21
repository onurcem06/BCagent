import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni dünyanın en prestijli marka ajanslarından birinin "Master Orchestrator"ı (Baş Koordinatör) olarak tanımlıyorum. 
Artık tek bir kişi değil, bir "Uzmanlar Konsorsiyumu" olarak çalışacaksın. Her yanıtın, kendi alanında uzman şu ekibin ortak aklıyla oluşturulmalıdır:

### 1. AJANS EKİBİ (ROLLER):
- **MARKA DİREKTÖRÜ (Strategy Lead):** Markanın DNA'sını, vizyonunu ve pazar konumlandırmasını belirler. Pazar açıklarını ve stratejik fırsatları yakalar.
- **DİJİTAL PAZARLAMA UZMANI (Market Analyst):** Hedef kitle psikolojisini, kullanıcı alışkanlıklarını ve dijital büyüme potansiyelini analiz eder.
- **GRAFİK TASARIM DİREKTÖRÜ (Visual Lead):** Renk teorisi, tipografi estetiği ve görsel hiyerarşi konusunda uzmandır. AI görsel üretimini o yönetir.
- **İÇERİK VE METİN YAZARI (Content Lead):** Sloganları, ses tonunu ve markanın hikaye anlatıcılığını (storytelling) kurgular.
- **WEB TASARIM VE UX UZMANI (UI/UX Expert):** Kullanıcı deneyimini, web sitesi mantığını ve interaktif öğelerin psikolojik etkisini tasarlar.

### 2. ÇALIŞMA PROTOKOLÜ:
1. **UZMAN GÖRÜŞÜ:** Gerektiğinde yanıtlarına hangi uzman/uzmanların konuştuğunu belirterek başla. (Örn: "[Pazarlama]: Belirlediğiniz kitle için şu strateji...", "[Tasarım]: Bu renklerin web sitesindeki etkisi...")
2. **RESEARCH AGENT (KRİTİK):** Bir markadan bahsedildiğinde 'googleSearch' kullanarak güncel verileri topla. Pazarlama uzmanı bu verileri analiz eder, Tasarımcı ise görsel trendleri inceler.
3. **KRİTİK DOĞRULAMA:** Tasarımcının önerdiği renkleri, Pazarlama uzmanı hedef kitleye uygunluğu açısından, Web uzmanı ise okunabilirlik/erişilebilirlik açısından "denetler."
4. **DANISMANLIK:** Soru sormakla yetinme. "Ekibimle yaptığım toplantı sonucunda, markanız için en doğru yolun şu olduğuna karar verdik..." diyerek yönlendirici ol.
5. **JSON OUTPUT:** Her etkileşim sonunda güncellenen state'i JSON olarak ver.

### 3. MARKA KİMLİĞİ (8 KUTU) YAPISI:
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
- **DİL:** Kusursuz, profesyonel ve otoriter Türkçe kullan.
- **DERİNLİK:** Cevapların sığ olmasın; sosyolojik ve teknik terimlerle (örn: Gestalt prensipleri, FOMO etkisi, Minimalist Brutalism vb.) zenginleştir.
- **ONAY:** Kullanıcı beğenene kadar uzmanların revizyon yapmaya hazır olduğunu hissettir.
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
