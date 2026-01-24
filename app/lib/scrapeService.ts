import * as cheerio from 'cheerio';
import axios from 'axios';

export interface ScrapedData {
    url: string;
    title: string;
    description: string;
    text: string;
    imageUrl: string | null;
    imageBuffer?: Buffer | null;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
    try {
        // 1. Fetch HTML
        // Use a real User-Agent and headers to avoid immediate blocks
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
                'Referer': 'https://www.google.com/',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000 // 10s timeout
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 2. Extract Metadata (Title, Desc, OG:Image)
        const title = $('title').text().trim() ||
            $('meta[property="og:title"]').attr('content') || '';

        const description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') || '';

        // Find best image
        const ogImage = $('meta[property="og:image"]').attr('content');
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        let imageUrl = ogImage || twitterImage || null;

        // Ensure absolute URL for image
        if (imageUrl && !imageUrl.startsWith('http')) {
            try {
                imageUrl = new URL(imageUrl, url).toString();
            } catch (e) {
                imageUrl = null;
            }
        }

        // 3. Extract Clean Text
        // Remove noise
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('iframe').remove();
        $('noscript').remove(); // remove noscript tags which often contain "enable js" msgs

        // Get body text
        let text = $('body').text();

        // Clean whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // VALIDATION: If text is too short, it's likely a JS-only site or blocked
        if (text.length < 200) {
            console.warn(`Scrape warning: Text too short (${text.length} chars) for ${url}. Treating as failed to avoid hallucinations.`);
            return null;
        }

        // Limit text length (Gemini Flash has large context but let's be efficient)
        // 15k characters is usually enough for "About Us" + "Home"
        const MAX_TEXT_LENGTH = 15000;
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.substring(0, MAX_TEXT_LENGTH) + '...';
        }

        // 4. Fetch Image Buffer if available (for Gemini Vision)
        let imageBuffer: Buffer | null = null;
        if (imageUrl) {
            try {
                const imgResponse = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 5000
                });
                imageBuffer = Buffer.from(imgResponse.data);
            } catch (imgErr) {
                console.warn(`Failed to fetch OG image from ${imageUrl}:`, imgErr);
                // Continue without image buffer
            }
        }

        return {
            url,
            title,
            description,
            text,
            imageUrl,
            imageBuffer
        };

    } catch (error) {
        // console.error(`Scrape failed for ${url}:`, error); // Reduce noise
        return null; // Fail gracefully
    }
}
