import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Force load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function runTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key found:", !!apiKey);
    if (apiKey) {
        console.log("API Key starts with:", apiKey.substring(0, 5) + "...");
    } else {
        console.error("NO API KEY FOUND!");
        return;
    }

    console.log("Testing Raw HTTP Model List...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        console.log("HTTP Status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models found in response:", data);
            }
        } else {
            console.log("Error Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("HTTP Request Failed:", error);
    }
}

runTest();
