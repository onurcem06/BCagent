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
        // Use a real User-Agent to avoid immediate blocks
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

        // Get body text
        let text = $('body').text();

        // Clean whitespace
        text = text.replace(/\s+/g, ' ').trim();

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
        console.error(`Scrape failed for ${url}:`, error);
        return null; // Fail gracefully
    }
}
