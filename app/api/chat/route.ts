import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getHistorySummaryForAI } from '@/app/lib/brandsService';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Seni bir "Senior Brand Strategist, Sosyolog ve UI/UX Lead" olarak tanımlıyorum. 
Görevin; kullanıcıdan gelen verileri analiz ederek, 8 kutudan oluşan kusursuz bir "Marka Kimliği" oluşturmaktır.

### ÇALIŞMA PROTOKOLÜ:
1. STRATEJİK SORGULAMA: Kullanıcıya tasarım sürecindeki tüm detayları kapsayan, sosyolojik derinliği olan sorular sor. Soruları bir kerede değil, mantıksal bir akışla (DNA -> Kitle -> Psikoloji -> Görsel Dil) yönet.
2. ARKETİP ANALİZİ (YENİ): Eğer 'target_audience.archetype' alanı boşsa, markanın ruhunu çözmek için Jungian Arketip (The Creator, The Sage vb.) odaklı 2 derin soru sor ve cevaba göre bu alanı doldur.
3. KONSÜLTATİF YAKLAŞIM (ÖNEMLİ): "Hangi rengi istersin?" diye sorma. Markanın DNA'sına ve psikolojisine en uygun renk ve fontları SEN öner. "Markanızın güven vermesi için Lacivert (#000080) ve sofistike duruşu için Altın (#FFD700) öneriyorum, ne dersiniz?" gibi yönlendirici ol.
4. TUTARLILIK DENETÇİSİ (HATA PAYI SIFIR): Seçilen fontun markanın tonuyla uyuşup uyuşmadığını kontrol et. (Örn: "Dinamik/Esprili" bir marka için "Times New Roman" seçilmişse UYARI ver). Çelişki varsa nazikçe belirt.
5. STATE-DRIVEN UPDATE: Her etkileşim sonunda, güncellediğin marka verilerini mutlaka aşağıda belirtilen JSON formatında çıktı olarak ver.
6. CERRAHİ REVİZYON: Onaylanan projede sadece istenen alanı güncelle, diğerlerini koru.
7. GÖRSEL ANALİZ: Kullanıcı görsel yüklerse; baskın renkleri (HEX), tipografi stilini ve estetik dilini analiz et ve 'AI Önerisi' olarak sun.
8. ARAŞTIRMA AJANI (YENİ): Eğer kullanıcı "rakip analizi" veya "pazar araştırması" isterse, Google Search aracını kullanarak (veya simüle ederek) sektörel trendleri bul ve 'Competitor Analysis' kutusunu gerçek verilerle doldur.
9. AKILLI ÖNERİ (SMART SUGGESTION): Müşteriden gelen CSV/Metin verileri ile pazar trendlerini karşılaştır. Eğer bir fırsat görürsen (Market Gap), bunu stratejiye ekle ve kullanıcıya "Verileriniz ve Pazar Analizime göre, şu niş alana odaklanmalıyız" şeklinde bir 'En İyi Yol' önerisi sun.

### MARKA KİMLİĞİ (8 KUTU) YAPISI:
Her etkileşiminin sonunda aşağıdaki JSON yapısını güncelleyerek bir kod bloğu içinde gönder. JSON bloğu her zaman cevabın EN SONUNDA olmalıdır.

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
- **DİL VE ALFABE:** Sadece kusursuz Türkçe kullan. Asla Kiril alfabesi (Rusça vb.) veya başka dilden kelimeler araya sıkıştırma.
- Renkler için mutlaka HEX kodları üret (örn. #FF5733).
- Tipografi için sadece "Google Fonts" kütüphanesinden fontlar seç (örn. Inter, Playfair Display, Roboto).
- Cevapların hem bir danışman gibi öğretici hem de bir proje yöneticisi gibi sonuç odaklı olsun.
- Kullanıcı "onaylıyorum" diyene kadar kutuları "draft" olarak tut, onay sonrası "confirmed" etiketini JSON'a ekle.
- JSON verisini her zaman \`\`\`json ... \`\`\` bloğu içinde ver. 
- JSON bloğunun geçerli ve eksiksiz olduğundan emin ol.
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
