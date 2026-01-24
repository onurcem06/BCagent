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

import { getCachedAgentResponse, setCachedAgentResponse } from '@/app/lib/cacheService';
import { scrapeWebsite } from '@/app/lib/scrapeService';

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, onRetry?: (attempt: number) => void): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0) {
            const shouldRetry = error.message?.includes('429') ||
                error.status === 429 ||
                error.message?.includes('quota') ||
                error.status >= 500; // Retry on server errors too

            if (shouldRetry) {
                if (onRetry) onRetry(retries);
                await new Promise(resolve => setTimeout(resolve, delay));
                return withRetry(fn, retries - 1, delay * 2, onRetry);
            }
        }
        throw error;
    }
}

async function runAgent(apiKey: string, systemPrompt: string, userContent: string, imageBuffer?: Buffer, onRetry?: () => void) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
    });

    return await withRetry(async () => {
        if (imageBuffer) {
            // Multimodal Request
            return (await model.generateContent([
                userContent,
                {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: "image/jpeg" // Assuming JPEG/PNG for simplicity from scraper
                    }
                }
            ])).response.text();
        }
        return (await model.generateContent(userContent)).response.text();
    }, 3, 1500, (attempt) => {
        if (onRetry) onRetry();
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

        // Use Encoder for streaming
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                // Helper to send text chunks
                const send = (text: string) => controller.enqueue(encoder.encode(text));

                // Helper to send events (Hidden from chat, used for UI)
                const sendEvent = (event: string, meta?: string) => {
                    const payload = JSON.stringify({ event, meta });
                    controller.enqueue(encoder.encode(`__EVENT__${payload}__EVENT__`));
                };

                try {
                    // 1. AŞAMA: TEMEL ANALİZ (Sociologist & Psychologist - Paralel)
                    sendEvent('AGENT_START', 'SOSYOLOG');
                    sendEvent('AGENT_START', 'PSİKOLOG');

                    // URL Detection & Scraping
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const foundUrls = lastUserMessage.match(urlRegex);

                    let scrapedContext = "";
                    let siteImageBuffer: Buffer | undefined = undefined;

                    if (foundUrls && foundUrls.length > 0) {
                        const targetUrl = foundUrls[0];
                        sendEvent('AGENT_LOG', `[SİSTEM]: Web sitesi taranıyor: ${targetUrl}`);

                        const scrapeResult = await scrapeWebsite(targetUrl);

                        if (scrapeResult) {
                            scrapedContext = `
                            [WEB SİTESİ ANALİZİ - CANLI VERİ]:
                            URL: ${scrapeResult.url}
                            BAŞLIK: ${scrapeResult.title}
                            AÇIKLAMA: ${scrapeResult.description}
                            İÇERİK ÖZETİ: ${scrapeResult.text}
                            `;

                            if (scrapeResult.imageBuffer) {
                                siteImageBuffer = scrapeResult.imageBuffer;
                                sendEvent('AGENT_LOG', `[SİSTEM]: Site görseli ve içeriği başarıyla alındı.`);
                            } else {
                                sendEvent('AGENT_LOG', `[SİSTEM]: Site içeriği okundu (Görsel alınamadı).`);
                            }
                        } else {
                            sendEvent('AGENT_LOG', `[SİSTEM]: Siteye erişilemedi, normal analiz yapılıyor.`);
                        }
                    }

                    // Check Cache (Firebase Persistent)
                    const bypassCache = !!scrapedContext;

                    const [cachedSocio, cachedPsycho] = bypassCache ? [null, null] : await Promise.all([
                        getCachedAgentResponse(lastUserMessage, 'SOCIOLOGIST'),
                        getCachedAgentResponse(lastUserMessage, 'PSYCHOLOGIST')
                    ]);

                    let socioReport = "", psychoReport = "";

                    if (cachedSocio && cachedPsycho) {
                        socioReport = cachedSocio;
                        psychoReport = cachedPsycho;
                        sendEvent('AGENT_LOG', '[CACHE HIT]: Pazar verileri kalıcı hafızadan (Firebase) yüklendi.');
                    } else {
                        // Real API Call with Smart Retry
                        sendEvent('AGENT_LOG', '[SOSYOLOG]: Küresel trendler ve sektör verileri taranıyor...');
                        sendEvent('AGENT_LOG', '[PSİKOLOG]: Hedef kitle bilinçaltı haritası çıkarılıyor...');

                        // Inject Web Context if available
                        const analysisPrompt = scrapedContext
                            ? `KULLANICI MESAJI: ${lastUserMessage}\n\n${scrapedContext}\n\nTALİMAT: Yukarıdaki WEB SİTESİ verilerini (ve varsa görseli) temel alarak analiz yap. Sektörü ve markayı bu verilere göre tanımla.`
                            : `Analiz et: ${lastUserMessage}`;

                        const [socio, psycho] = await Promise.all([
                            runAgent(apiKey, AGENT_PROMPTS.SOCIOLOGIST, analysisPrompt, siteImageBuffer,
                                () => sendEvent('AGENT_LOG', '[SOSYOLOG]: Bağlantı gecikmesi. Tekrar deneniyor...')
                            ),
                            runAgent(apiKey, AGENT_PROMPTS.PSYCHOLOGIST, analysisPrompt, siteImageBuffer,
                                () => sendEvent('AGENT_LOG', '[PSİKOLOG]: Bağlantı gecikmesi. Tekrar deneniyor...')
                            )
                        ]);

                        socioReport = socio;
                        psychoReport = psycho;

                        // Update Cache (Only if generic message, maybe don't cache deeply context-heavy scraped stuff? keeping simple for now)
                        if (!scrapedContext) {
                            setCachedAgentResponse(lastUserMessage, 'SOCIOLOGIST', socio);
                            setCachedAgentResponse(lastUserMessage, 'PSYCHOLOGIST', psycho);
                        }
                    }

                    sendEvent('AGENT_DONE', 'SOSYOLOG');
                    sendEvent('AGENT_DONE', 'PSİKOLOG');

                    // 2. AŞAMA: GÖRSEL STRATEJİ
                    sendEvent('AGENT_START', 'STRATEJİST');
                    sendEvent('AGENT_LOG', '[STRATEJİST]: Veriler görsel dile çevriliyor...');

                    const stratInput = `
                    KULLANICI TALEBİ: ${lastUserMessage}
                    SOSYOLOG RAPORU: ${socioReport}
                    PSİKOLOG RAPORU: ${psychoReport}
                    GÖREV: Bu analizlere dayanarak görsel stratejiyi oluştur.
                    `;
                    const strategistReport = await runAgent(apiKey, AGENT_PROMPTS.STRATEGIST, stratInput);
                    sendEvent('AGENT_DONE', 'STRATEJİST');

                    // 3. AŞAMA: PAZARLAMA (Marketeer)
                    sendEvent('AGENT_START', 'MARKETEER');
                    sendEvent('AGENT_LOG', '[PAZARLAMACI]: Büyüme ve konumlandırma kurgulanıyor...');
                    const marketInput = `
                    KULLANICI TALEBİ: ${lastUserMessage}
                    STRATEJİST RAPORU: ${strategistReport}
                    GÖREV: Pazarlama stratejisini oluştur.
                    `;
                    const marketeerReport = await runAgent(apiKey, AGENT_PROMPTS.MARKETEER, marketInput);
                    sendEvent('AGENT_DONE', 'MARKETEER');

                    // 4. AŞAMA: RED TEAM (Critic)
                    sendEvent('AGENT_START', 'CRITIC');
                    sendEvent('AGENT_LOG', '[RED TEAM]: Risk analizi ve açık arama başlatıldı...');
                    const criticInput = `
                    STRATEJİ: ${strategistReport}
                    GÖREV: Zayıf noktaları bul ve sertçe eleştir.
                    `;
                    const criticReport = await runAgent(apiKey, AGENT_PROMPTS.CRITIC, criticInput);
                    sendEvent('CRITIC_REPORT', criticReport);
                    sendEvent('AGENT_DONE', 'CRITIC');

                    // 5. AŞAMA: DİREKTÖR (Final Stream)
                    sendEvent('AGENT_START', 'DİREKTÖR');
                    sendEvent('AGENT_LOG', '[DİREKTÖR]: Tüm raporlar masamda. Sentez yapılıyor...');

                    const warRoomContext = `
                    GÖREV: Aşağıdaki raporları kullanarak nihai stratejiyi belirle.
                    
                    KULLANICI TALEBİ: "${lastUserMessage}"
                    
                    [UZMAN RAPORLARI ÖZETİ]:
                    - Sosyolog: ${socioReport.substring(0, 500)}...
                    - Psikolog: ${psychoReport.substring(0, 500)}...
                    - Stratejist: ${strategistReport}
                    - Pazarlamacı: ${marketeerReport}
                    - RED TEAM UYARISI: ${criticReport}
                    
                    TALİMAT: Red Team'in eleştirilerini dikkate alarak final raporu yaz.
                    1. "MASTER BRAND BLUEPRINT" Markdown Raporu.
                    2. JSON Veri Bloğu (En sonda).
                    `;

                    const historyContext = await getHistorySummaryForAI();
                    const mainSystemPrompt = `
                    ${AGENT_PROMPTS.DIRECTOR}
                    ${historyContext ? `\n### GEÇMİŞ BİLGİ:\n${historyContext}` : ""}
                    ### FORMAT:
                    \`\`\`json
                    ${JSON_SCHEMA}
                    \`\`\`
                    `;

                    const model = genAI.getGenerativeModel({
                        model: MODEL_NAME,
                        systemInstruction: mainSystemPrompt
                    });

                    // Streaming Chat
                    const chat = model.startChat({ history: [] }); // Simplified history for stream
                    const result = await chat.sendMessageStream(warRoomContext);

                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        send(chunkText);
                    }

                    sendEvent('AGENT_DONE', 'DİREKTÖR');
                    controller.close();

                } catch (error: any) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
