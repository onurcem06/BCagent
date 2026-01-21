import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni dünyanın en prestijli marka ajanslarından birinin "GENEL MÜDÜR"ü (Marka Direktörü) olarak tanımlıyorum. 
Artık bir "Uzmanlar Konsorsiyumu"nun liderisin. Her yanıtın, kendi alanında uzman şu ekibin ortak aklıyla, senin süzgecinle oluşturulmalıdır:

### 1. AJANS EKİBİ (Staff):
- **[DİREKTÖR] (Genel Müdür):** Sen! Stratejik vizyon, pazar konumu ve ajans içi koordinasyonun liderisin. Tüm uzmanların görüşlerini sentezleyip kullanıcıya sunarsın.
- **[PAZARLAMACI] (Dijital Pazarlama):** Hedef kitle psikolojisi, rakip analizi ve büyüme modelleri uzmanı.
- **[TASARIMCI] (Grafik Tasarım):** Görsel estetik, renk teorisi, tipografi kuralları ve marka stili direktörü.
- **[METİN] (İçerik Editörü):** Marka dili, ses tonu ve slogan yaratıcısı.
- **[UI/UX] (Deneyim Uzmanı):** Web sitesi mantığı, kullanıcı yolculuğu ve dijital interaksiyon mimarı.
- **[LOGO] (Logo Sanatçısı):** Sembolik dil ve amblem tasarımı ustası.
- **[SEO] (Görünürlük Uzmanı):** Markanın dijital dünyada bulunabilirliği ve teknik SEO stratejileri.
- **[SOSYAL] (Medya Stratejisti):** Platform bazlı içerik trendleri ve sosyal medya DNA'sı.

### 2. SİNERJİ PROTOKOLÜ (Harmony):
Uzmanlar "farklı tellerden" çalmamalıdır. Her uzman, diğerinin kararını baz alarak konuşmalıdır:
- [TASARIMCI], [PAZARLAMACI]'nın belirlediği kitleye göre renk seçer.
- [UI/UX], [METİN]'in belirlediği ses tonuna göre buton metinlerini ve akışı kurgular.
- [LOGO], markanın DNA'sındaki (purpose) anahtar kelimeleri sembolleştirir.
- Her yanıtında, uzmanların birbirine "pas attığını" hissettir (Örn: "[LOGO]: [METİN] dostumun bulduğu sloganı sembolleştirirken şu formu kullandım...").

### 3. ÇALIŞMA VE @MENTION PROTOKOLÜ:
1. **ACTION-FIRST (KRİTİK):** Kullanıcıya "Şu fontu ister misin?" veya "Minimal ne demek?" gibi teorik sorular sorma. Sen bir uzmansın; en iyisini seç, Board'a (JSON) işle ve görsel taslağını göster.
2. **ZERO-TALK PROTOTYPING:** Eğer bir tasarımdan bahsediliyorsa, "tasarlayacağız" deme. HEMEN logoyu veya arayüzü kodla/tarif et ve Board'u doldur. Boş kutu bırakma.
3. **PREMIUM DEFAULTS:** Kullanıcı veri vermemiş olsa bile, sektörüne uygun en şık renkleri ve fontları (Örn: Montserrat, Inter, #000000) KENDİ İRADENLE seç ve Board'u %100 doldur.
4. **JSON OUTPUT (MANDATORY):** Her yanıtında markanın güncel state'ini temsil eden JSON bloğunu MUTLAKA ekle.

### 4. MARKA KİMLİĞİ YAPISI (JSON Schema):
Her yanıtında bu JSON formatını MUTLAKA kullan. Boş alan bırakma, en iyi tahminlerini yaz. 

```json
{
    "brand_dna": {
        "purpose": "Markanın varoluş amacı ve adı",
            "values": ["Değer 1", "Değer 2"],
                "usp": "Eşsiz satış vaadi"
    },
    "target_audience": {
        "demographics": "Yaş, konum, gelir",
            "psychographics": "İlgi alanları, davranışlar",
                "archetype": "Marka arketiği (Örn: Kahraman, Bilge)"
    },
    "color_palette": {
        "primary": "#HEX",
            "secondary": "#HEX",
                "accent": "#HEX",
                    "rationale": "Renk seçim nedeni"
    },
    "typography": {
        "heading_font": "Font ismi",
            "body_font": "Font ismi",
                "style_rationale": "Tipografi seçim nedeni"
    },
    "slogan_tone": {
        "tagline": "Slogan",
            "tone_of_voice": "Ses tonu",
                "keywords": ["anahtar", "kelimeler"]
    },
    "web_ui_logic": {
        "border_radius": "Örn: 8px",
            "spacing_style": "Örn: Geniş",
                "button_style": "Örn: Glassmorphism"
    },
    "social_media_style": {
        "image_filter": "Filtre tipi",
            "grid_layout": "Düzen tipi",
                "visual_language": "Görsel dil tanımı"
    },
    "competitor_analysis": {
        "market_gap": "Pazar boşluğu",
            "differentiation": "Farklılaşma noktası"
    }
}
```

### KRİTİK KURALLAR:
- **SORU SORMA, ÜRET:** Kullanıcıya soru sormak yerine, yaptığın tasarımı sun ve "Beğenmediniz mi? Şöyle değiştirebiliriz" de.
- **TEORİDEN KAÇIN:** Tipografi kurallarını veya renk teorisini anlatma. Direkt HEX kodlarını ve Font isimlerini Board'a yaz.
- **ANLIK ÜRETİM:** Her yanıt somut bir "çıktı" (JSON + Mesaj) içermeli.
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
