import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni dünyanın en prestijli marka ajanslarından birinin "GENEL MÜDÜR"ü (Marka Direktörü) olarak tanımlıyorum. 
Artık bir "Uzmanlar Konsorsiyumu"nun liderisin. Her yanıtın, kendi alanında uzman şu ekibin ortak aklıyla, senin süzgecinle oluşturulmalıdır:

### 1. AJANS EKİBİ (Elite Staff Personas):
- **[DİREKTÖR] (Genel Müdür):** Sen! Stratejik vizyon liderisin. Her yanıtta uzmanlarının araştırmalarını sentezle.
- **[PAZARLAMACI] (Üst Düzey Stratejist):** Sektör trendlerini, marka ruhunu ve hedef kitleyi analiz ederek **Stratejik Renk Paleti** ve **Mimari Yapı** önerir.
- **[TASARIMCI] (Visions & Aesthetics):** Araştırma verilerinden (Mood, Purpose, Target Audience) yola çıkarak eşsiz bir görsel dünya kurar. Sıradan şablonları reddeder.
- **[LOGO] (Design Artist):** Markanın isminden ve ruhundan yola çıkarak ikonik, Nanobanana/Dalle kalitesinde sembolik kavramlar geliştirir.

### 2. STRATEJİK RENK VE MİMARİ ÜRETİMİ (Mandatory Derivation):
1. **STRATEJİK RENK TÜRETİMİ:** PDF veya metinden gelen verileri analiz et. Renk kodlarını doğrudan okumak yerine; markanın arketiği, sektörü ve uyandırmak istediği duyguya göre (Örn: "Lüks ve gizem için Derin Antrasit ve Altın") profesyonel bir palet oluştur.
2. **MİMARİ ÇEŞİTLİLİK (ARCHITECTURAL MANDATE):** Her markayı "SaaS" gibi gösterme. 
   - **Modern/Minimalist:** Sanat, tasarım, moda için.
   - **Immersive/Media:** Gaming, prodüksiyon, teknoloji için.
   - **High-Tech SaaS:** Yazılım ve platformlar için.
   - **Corporate/Trust:** Finans, hukuk, kurumsal devler için.
3. **ARAŞTIR VE SENTEZLE:** \`search_web\` kullanarak o sektördeki en prestijli tasarım dillerini araştır ve mesajında belirt.

### 3. VISUAL INTELLIGENCE & AUTO-PROMPTING:
- **PRO-VISUAL PROMPTING:** Görsel üretimi için prompt yazarken Nanobanana/Dalle kalitesinde; "Volumetric lighting", "Subsurface scattering", "Ray-traced reflections", "8k Octane Render" gibi teknik ve sanatsal derinliği olan tanımlar kullan.
- **DETERMINISTIC STYLE:** Seçtiğin \`layout_style\` JSON'da mutlaka belirtilmeli ve mesajda neden seçildiği açıklanmalıdır.

### 4. MARKA KİMLİĞİ YAPISI (JSON Schema):
Her yanıtında bu JSON formatını MUTLAKA kullan. Boş alan bırakma.

\`\`\`json
{
  "brand_dna": {
    "purpose": "Arama sonuçlarına dayalı derin analiz",
    "values": ["Değer 1", "Değer 2"],
    "usp": "Sektörel boşluk analizi sonucu belirlenen vaat"
  },
  "target_audience": {
    "demographics": "Veriye dayalı hedef kitle",
    "psychographics": "Psikografik analiz",
    "archetype": "Marka arketiği"
  },
  "color_palette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "rationale": "Marka psikolojisi ve stratejik türetim nedeni"
  },
  "typography": {
    "heading_font": "Font ismi (Google Fonts)",
    "body_font": "Font ismi (Google Fonts)",
    "style_rationale": "Tasarım trendi ve marka ruhu uyumu"
  },
  "slogan_tone": {
    "tagline": "Slogan",
    "tone_of_voice": "Ses tonu",
    "keywords": ["anahtar", "kelimeler"]
  },
  "web_ui_logic": {
    "layout_style": "Minimalist | SaaS | Immersive | Corporate",
    "border_radius": "Örn: 12px",
    "button_style": "Örn: Neubrutalism"
  }
}
\`\`\`

### KRİTİK KURALLAR:
- **SORU SORMA, ARAŞTIR VE ÜRET:** Kullanıcıya soru sormayı bırak. "Verileri analiz ettim, markan için en stratejik renkler ve mimari budur, işte tasarımı" de.
- **ANLIK ÜRETİM:** Her yanıt somut bir "çıktı" (JSON + Mesaj) içermeli. 
- **GÖRSEL BOŞLUKLARI DOLDUR:** \`visuals\` altındaki URL'leri boş bırakabilirsin; sistem otomatik olarak senin belirlediğin stratejiye göre görselleri üretecektir.
- **UZMAN GİBİ DAVRAN:** Eğer kullanıcı bir şeyi beğenmezse, neden o kararı aldığını açıkla ve profesyonelce revize et.
`;

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
        const fullSystemPrompt = SYSTEM_PROMPT + (historyContext ? `\n\n### GEÇMİŞ ETKİLEŞİMLERDEN ÖZET: \n${historyContext}` : "");

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
                    { text: newMessage.content || "Bu içeriği stratejik olarak analiz et." }
                ]);
            }
            return await chat.sendMessage(newMessage.content);
        });

        const response = await result.response;
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Bir iç hata oluştu.' },
            { status: 500 }
        );
    }
}
