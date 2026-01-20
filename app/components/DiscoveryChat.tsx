"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, Save, Upload } from 'lucide-react';
import { useBrandStore } from '../lib/store';
import { saveBrandIdentity } from '../lib/brandsService';
import { v4 as uuidv4 } from 'uuid';

export default function DiscoveryChat() {
    const { identity, updatePartialIdentity, currentBrandId, setCurrentBrandId } = useBrandStore();
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string; image?: string | null }[]>([
        { role: 'ai', content: "Merhaba, ben marka stratejistiniz. Bugün projeniz için hata payı sıfır olan bir marka kimliği inşa edeceğiz. Başlamadan önce, bu markanın varoluş hikayesini ve çözdüğü temel problemi bana anlatır mısınız?" }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Brand ID for persistence
    useEffect(() => {
        if (!currentBrandId) {
            const newId = uuidv4();
            setCurrentBrandId(newId);
        }
    }, [currentBrandId, setCurrentBrandId]);

    // Debounced Auto-save to Firestore
    useEffect(() => {
        if (!currentBrandId || !identity.brand_dna.purpose) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await saveBrandIdentity(currentBrandId, identity);
            } catch (err) {
                console.error("Auto-save failed", err);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [identity, currentBrandId]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target?.result;
                if (typeof text === 'string') {
                    const dataPrompt = `DATA_IMPORT_ACTION: Aşağıdaki müşteri verilerini analiz et ve Marka Kimliği kutularını (özellikle Hedef Kitle ve USP) bu verilere dayanarak otomatik doldur.\n\nVERİ SETİ: \n${text.substring(0, 5000)}`;

                    setMessages(prev => [...prev, { role: 'user', content: "📂 [CSV Verisi Yüklendi] Verileri analiz et ve marka kimliğini oluştur." }]);
                    setIsLoading(true);

                    try {
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                messages: messages,
                                newMessage: { role: 'user', content: dataPrompt }
                            }),
                        });

                        if (!response.ok) throw new Error('Data analysis failed');

                        const data = await response.json();
                        extractJson(data.content);
                        setMessages(prev => [...prev, { role: 'ai', content: data.content }]);

                    } catch (error) {
                        setMessages(prev => [...prev, { role: 'ai', content: "Veri analizi sırasında bir hata oluştu." }]);
                    } finally {
                        setIsLoading(false);
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const extractJson = (text: string) => {
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        let cleanedJson = "";
        if (match && match[1]) {
            cleanedJson = match[1].trim();
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedJson = text.substring(firstBrace, lastBrace + 1);
            }
        }

        if (cleanedJson) {
            try {
                const jsonData = JSON.parse(cleanedJson);
                updatePartialIdentity(jsonData);
                return true;
            } catch (e) {
                console.error("Failed to parse JSON", e);
            }
        }
        return false;
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg = input;
        const currentImage = selectedImage;

        setInput('');
        setSelectedImage(null);

        const displayMsg = currentImage ? `${userMsg} [Görsel Yüklendi]` : userMsg;
        setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    newMessage: { role: 'user', content: userMsg, image: currentImage }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch response');
            }

            const data = await response.json();
            const aiContent = data.content;

            extractJson(aiContent);
            setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);

        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'ai', content: error.message || "Bir hata oluştu. Lütfen tekrar deneyin." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30 backdrop-blur-xl border-r border-slate-800/50 relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Branding Cockpit
                    </h2>
                    <div className="flex items-center gap-3">
                        {isSaving && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 animate-pulse">
                                <Save className="w-3 h-3" />
                                SAVING
                            </div>
                        )}
                        {!isSaving && identity.brand_dna.purpose && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500/70">
                                <Save className="w-3 h-3" />
                                SYNCED
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">Strategic Design Assistant</p>
            </div>

            {/* Actions Bar */}
            <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                <input type="file" ref={csvInputRef} className="hidden" accept=".csv,.txt" onChange={handleCsvSelect} />
                <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-all text-xs text-slate-300"
                    onClick={() => csvInputRef.current?.click()}
                >
                    <Upload className="w-3 h-3" />
                    Veri Aktar
                </button>
                <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs ${selectedImage ? 'bg-purple-900/40 border-purple-500 text-purple-200' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="w-3 h-3" />
                    İlham Görseli
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-900/20'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                            }`}>
                            {msg.role === 'ai' ? msg.content.replace(/```json[\s\S]*?```/g, '').trim() : msg.content}
                            {msg.role === 'ai' && msg.content.includes('```json') && (
                                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-2 text-[10px] font-bold text-purple-400">
                                    <Sparkles className="w-3 h-3" />
                                    STRATEJİ GÜNCELLENDİ
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-bl-none p-4 max-w-[80%] border border-slate-700 shadow-xl">
                            <div className="flex items-center gap-4">
                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-300">Strateji Analiz Ediliyor...</span>
                                    <div className="h-1 w-32 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800/50">
                {selectedImage && (
                    <div className="mb-3 relative inline-block group">
                        <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border-2 border-purple-500/50 shadow-lg" />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isLoading ? "Yapay zeka analiz ediyor..." : "Mesajınızı yazın..."}
                            disabled={isLoading}
                            className="w-full bg-slate-800/80 text-white rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none min-h-[50px] max-h-[200px] border border-slate-700"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            className="absolute right-2 bottom-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-0 shadow-lg shadow-purple-900/40"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
