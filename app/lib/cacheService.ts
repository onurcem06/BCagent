import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CACHE_COLLECTION = 'agent_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Generates a consistent hash key for a prompt
 */
function generateCacheKey(prompt: string, agentId: string): string {
    // Simple hash for string content
    let hash = 0;
    const keyString = `${agentId}:${prompt.trim().toLowerCase().substring(0, 200)}`; // limit key length
    for (let i = 0; i < keyString.length; i++) {
        const char = keyString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `cache_${Math.abs(hash)}`;
}

interface CacheEntry {
    response: string;
    timestamp: number;
    agentId: string;
}

export async function getCachedAgentResponse(prompt: string, agentId: string): Promise<string | null> {
    if (!db) return null;

    try {
        const key = generateCacheKey(prompt, agentId);
        const docRef = doc(db, CACHE_COLLECTION, key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as CacheEntry;
            const now = Date.now();
            
            // Check TTL
            if (now - data.timestamp < CACHE_TTL_MS) {
                return data.response;
            }
        }
    } catch (error) {
        console.error("Cache fetch error:", error);
    }
    return null;
}

export async function setCachedAgentResponse(prompt: string, agentId: string, response: string): Promise<void> {
    if (!db) return;

    try {
        const key = generateCacheKey(prompt, agentId);
        const docRef = doc(db, CACHE_COLLECTION, key);
        
        const entry: CacheEntry = {
            response,
            timestamp: Date.now(),
            agentId
        };

        await setDoc(docRef, entry);
    } catch (error) {
        console.error("Cache save error:", error);
    }
}
