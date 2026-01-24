"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, Save, Upload, Library, X, AlertTriangle } from 'lucide-react';
import { useBrandStore } from '../lib/store';
import { saveBrandIdentity } from '../lib/brandsService';
import { v4 as uuidv4 } from 'uuid';
import BrandLibrary from './BrandLibrary';
import RedTeamSidebar from './RedTeamSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_COLORS: Record<string, string> = {
    '[DİREKTÖR]': 'border-purple-500/50 bg-purple-500/10 text-purple-200',
    '[STRATEJİST]': 'border-blue-500/50 bg-blue-500/10 text-blue-200',
    '[SOSYOLOG]': 'border-amber-500/50 bg-amber-500/10 text-amber-200',
    '[PSİKOLOG]': 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200',
    '[MARKETEER]': 'border-green-500/50 bg-green-500/10 text-green-200',
    '[CRITIC]': 'border-red-500/50 bg-red-500/10 text-red-200',
    '[RED TEAM]': 'border-red-500/50 bg-red-500/10 text-red-200',
};

const AGENCY_STAFF = [
    { id: 'DİREKTÖR', name: 'Genel Müdür', role: 'Strategy & Orchestration', color: 'bg-purple-500' },
    { id: 'SOSYOLOG', name: 'Toplum Mühendisi', role: 'Cultural Analyst', color: 'bg-amber-500' },
    { id: 'PSİKOLOG', name: 'Davranış Bilimci', role: 'Behavioral Scientist', color: 'bg-cyan-500' },
    { id: 'STRATEJİST', name: 'Görsel Mimar', role: 'Visual Strategist', color: 'bg-blue-500' },
    { id: 'MARKETEER', name: 'Pazarlama Direktörü', role: 'Growth Hacker', color: 'bg-green-500' },
    { id: 'CRITIC', name: 'Baş Denetçi', role: 'Red Team Lead', color: 'bg-red-600' },
];

interface AgentStatus {
    status: 'idle' | 'working' | 'done';
}

const AgentAvatar = ({ id, color, name, status = 'idle', onClick }: { id: string, color: string, name: string, status?: 'idle' | 'working' | 'done', onClick?: () => void }) => {
    const isWorking = status === 'working';
    const isDone = status === 'done';

    return (
        <motion.div
            onClick={onClick}
            layout
            initial={false}
            animate={{
                scale: isWorking ? 1.05 : 1,
                backgroundColor: isWorking ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0)'
            }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
            className={`relative flex flex-col items-center gap-1 group cursor-pointer p-1 rounded-lg transition-colors`}
        >
            <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg 
                ${isWorking ? 'border-amber-400 text-white shadow-amber-500/50' : ''}
                ${isDone ? 'border-green-400 text-white bg-green-500/20' : ''}
                ${status === 'idle' ? `border-slate-700 text-slate-500 ${color.replace('bg-', 'group-hover:bg-')}` : ''}
            `}>
                {/* Active Glow Effect */}
                {isWorking && (
                    <motion.div
                        layoutId="active-glow"
                        className={`absolute inset-0 rounded-full blur-md opacity-75 ${color}`}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                )}

                <span className="relative z-10">{status === 'done' ? '✓' : id[0]}</span>
            </div>

            {/* Status Dot */}
            <AnimatePresence>
                {(isWorking || isDone) && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 z-20
                        ${isWorking ? 'bg-amber-500' : 'bg-green-500'}`}
                    >
                        {isWorking && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-amber-400"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <span className={`text-[9px] font-medium max-w-[60px] truncate text-center hidden md:block transition-colors
                ${isWorking ? 'text-amber-400 font-bold' : isDone ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}
            `}>
                {name.split(' ')[0]}
            </span>
        </motion.div>
    );
};

const RedTeamCritique = ({ content }: { content: string }) => {
    // Remove the prefix if it exists
    const cleanContent = content.replace(/^\[RED TEAM\]:\s*/, '').trim();

    return (
        <div className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-red-500/50 rounded-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-red-950/30 border-b border-red-900/50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-500/20 p-1.5 rounded-lg border border-red-500/30 animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-red-400 tracking-widest uppercase">KRİTİK RİSK RAPORU</h3>
                            <p className="text-[9px] text-red-300/60 font-mono">RED TEAM PROTOCOL v9.0</p>
                        </div>
                    </div>
                    <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400 font-bold uppercase">
                        ACTION REQUIRED
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gradient-to-b from-slate-900 to-red-950/10">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <MessageContent content={cleanContent} />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2 bg-red-950/20 border-t border-red-900/30 flex items-center justify-end gap-2">
                    <span className="text-[9px] text-red-500/50 font-mono italic">Bu eleştiriler stratejiye entegre edilmelidir.</span>
                </div>
            </div>
        </div>
    );
};

const MessageContent = ({ content }: { content: string }) => {
    const parts = content.split(/(\[[A-ZİÜÖĞÇ\s]+\]:)/g);
    if (parts.length <= 1) return <div className="whitespace-pre-wrap">{content}</div>;
    return (
        <div className="space-y-4">
            {parts.map((part, i) => {
                const roleMatch = part.match(/^(\[[A-ZİÜÖĞÇ\s]+\]):$/);
                if (roleMatch) {
                    const currentRole = roleMatch[1];
                    const colorClasses = ROLE_COLORS[currentRole] || 'border-slate-500/50 bg-slate-500/10 text-slate-200';
                    return (
                        <div key={i} className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border w-fit mb-1 mt-3 first:mt-0 ${colorClasses}`}>
                            {currentRole.replace(/[\[\]]/g, '')}
                        </div>
                    );
                }
                if (!part.trim()) return null;
                return (
                    <div key={i} className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap pl-1 border-l-2 border-slate-800/50 ml-1 py-1">
                        {part}
                    </div>
                );
            })}
        </div>
    );
};

export default function DiscoveryChat() {
    const { identity, updatePartialIdentity, currentBrandId, setCurrentBrandId, setLatestReport } = useBrandStore();
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string; image?: string | null }[]>([
        { role: 'ai', content: "[DİREKTÖR]: Merhaba! Branding Cockpit'e hoş geldiniz. Bugün markanızın temellerini uzman ekibimle birlikte inşa edeceğiz.\n\nBaşlamadan önce ajans protokolümüz gereği şu bilgilere ihtiyacımız var:\n1. Markanızın adı (Veya bulmamızı ister misiniz?)\n2. Sektörünüz ve varsa web sitesi linkiniz\n3. İlham verebilecek referans markalar veya dosyalar\n\nHangi marka üzerinde çalışıyoruz?" }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [agentStatuses, setAgentStatuses] = useState<Record<string, 'idle' | 'working' | 'done'>>({});
    const [systemStatus, setSystemStatus] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    // ... existing refs ...
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

    const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
    const [lastTriggeredData, setLastTriggeredData] = useState<string>('');

    // Auto-save to Firestore (Debounced) - Only if meaningful data exists
    useEffect(() => {
        if (!currentBrandId) return;

        // Prevent ghost records: Only save if there is at least a purpose or name
        if (!identity.brand_dna.purpose && !identity.brand_name) return;

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

    // Reset messages when switching brands to avoid context confusion
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (currentBrandId) {
            setMessages([
                { role: 'ai', content: "[DİREKTÖR]: Kütüphaneden seçilen marka yüklendi. Strateji tahtası güncellendi. Mevcut veriler üzerinden devam edebilir veya yeni revizyonlar isteyebilirsiniz.\n\nNasıl ilerleyelim?" }
            ]);
        }
    }, [currentBrandId]);

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
            // Check file size (Vercel/Server limit is typically 4.5MB. Base64 adds ~33% overhead.)
            // We set a safe limit of 3.5MB to ensure the total payload stays under limits.
            const MAX_SIZE = 3.5 * 1024 * 1024; // 3.5MB limit
            if (file.size > MAX_SIZE) {
                setMessages(prev => [...prev, { role: 'ai', content: `[DİREKTÖR]: Dosya boyutu sınırın üzerinde (${(file.size / (1024 * 1024)).toFixed(2)} MB). Sistem performansı için lütfen 3.5MB'dan küçük dosyalar yükleyin.` }]);
                return;
            }

            const isPdf = file.type === 'application/pdf';
            const reader = new FileReader();

            reader.onload = async (event) => {
                const result = event.target?.result;
                if (!result) return;

                let dataPrompt = "";
                let attachment: string | null = null;

                if (isPdf) {
                    attachment = result as string;
                    dataPrompt = `DATA_IMPORT_ACTION: Yüklenen PDF dosyasını analiz et. Marka stratejisi için gerekli tüm verileri çıkar ve Board'u (JSON) doldur.`;
                } else {
                    const text = result as string;
                    dataPrompt = `DATA_IMPORT_ACTION: Aşağıdaki verileri analiz et. Marka adını tespit et ve stratejiye işle. Marka Kimliği (8 Kutu) yapısındaki tüm alanları doldur. \n\nVERİ SETİ: \n${text.substring(0, 10000)}`;
                }

                setMessages(prev => [...prev, { role: 'user', content: `📂 [${isPdf ? 'PDF' : 'Veri'} Dosyası Yüklendi] Analiz başlatılıyor...` }]);
                setIsLoading(true);

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: messages.slice(-5), // Send only last few messages to reduce payload size
                            newMessage: {
                                role: 'user',
                                content: dataPrompt,
                                image: attachment
                            }
                        }),
                    });

                    if (!response.ok) {
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            const err = await response.json();
                            throw new Error(err.error || 'Analiz başarısız oldu.');
                        } else {
                            const params = await response.text();
                            // Check for common proxy/server errors
                            if (params.includes('Entity Too Large') || response.status === 413) {
                                throw new Error('Dosya boyutu sunucu limitini aştı. Lütfen daha küçük bir dosya deneyin.');
                            }
                            throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`);
                        }
                    }

                    const data = await response.json();
                    const success = extractJson(data.content);

                    if (success) {
                        setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
                    } else {
                        setMessages(prev => [...prev, { role: 'ai', content: "[DİREKTÖR]: Verileri analiz ettim ancak strateji tahtasına aktarırken bir sorun oluştu. İşte analiz özetim: \n\n" + data.content }]);
                    }

                } catch (error: any) {
                    console.error("Analysis error:", error);
                    setMessages(prev => [...prev, { role: 'ai', content: `[DİREKTÖR]: Analiz sırasında teknik bir hata oluştu: ${error.message}. Lütfen dosyanın bozuk olmadığından emin olun.` }]);
                } finally {
                    setIsLoading(false);
                }
            };

            if (isPdf) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
    };

    const extractJson = (text: string) => {
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        let cleanedJson = "";
        let markdownReport = "";

        if (match && match[1]) {
            cleanedJson = match[1].trim();
            // Assuming the markdown report comes BEFORE the JSON block
            markdownReport = text.split('```json')[0].trim();
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedJson = text.substring(firstBrace, lastBrace + 1);
                markdownReport = text.substring(0, firstBrace).trim();
            }
        }

        // Save report to store if it exists and looks like a report
        if (markdownReport && (markdownReport.includes('#') || markdownReport.includes('**'))) {
            setLatestReport(markdownReport);
            // Also update identity state so it persists to DB
            updatePartialIdentity({ master_report_content: markdownReport });
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg = input;
        const currentImage = selectedImage;

        setInput('');
        setSelectedImage(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const displayMsg = currentImage ? `${userMsg} [Görsel Yüklendi]` : userMsg;
        setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);
        setIsLoading(true);
        setAgentStatuses({}); // Reset agents

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    newMessage: { role: 'user', content: userMsg, image: currentImage }
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to fetch response');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let aiMsgContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Loop to consume all complete events and safe text
                while (true) {
                    const eventStart = buffer.indexOf('__EVENT__');

                    if (eventStart === -1) {
                        // No event start marker found.
                        // Flush text safely: keep last 10 chars in case they are part of a partial marker
                        if (buffer.length > 10) {
                            const splitIndex = buffer.length - 10;
                            const textToFlush = buffer.substring(0, splitIndex);
                            aiMsgContent += textToFlush;
                            updateDirectorMessage(aiMsgContent);
                            buffer = buffer.substring(splitIndex);
                        }
                        break;
                    }

                    // We have an event start
                    // 1. Text before event
                    if (eventStart > 0) {
                        const textChunk = buffer.substring(0, eventStart);
                        aiMsgContent += textChunk;
                        updateDirectorMessage(aiMsgContent);
                        buffer = buffer.substring(eventStart);
                        // Now buffer starts with __EVENT__
                        continue;
                    }

                    // 2. Buffer starts with __EVENT__. Find end.
                    const eventEnd = buffer.indexOf('__EVENT__', 9); // After first marker
                    if (eventEnd === -1) {
                        // Incomplete event. Wait for more data.
                        break;
                    }

                    // 3. Extract and Process Event
                    const eventPayloadStr = buffer.substring(9, eventEnd);
                    try {
                        const payload = JSON.parse(eventPayloadStr);
                        handleAgentEvent(payload);
                    } catch (e) {
                        console.error("Event parse error", e);
                    }

                    // 4. Remove event from buffer
                    buffer = buffer.substring(eventEnd + 9);
                }
            }

            // Flush remaining buffer
            if (buffer) {
                aiMsgContent += buffer;
                updateDirectorMessage(aiMsgContent);
            }

            // Finalize
            extractJson(aiMsgContent); // Try to extract JSON from the full response

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Bir hata oluştu. Lütfen tekrar deneyin.";
            setMessages(prev => [...prev, { role: 'ai', content: message }]);
        } finally {
            setIsLoading(false);
            setAgentStatuses(prev => {
                // Mark all as done or idle when finished
                return prev;
            });
        }
    };

    const updateDirectorMessage = (text: string) => {
        setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];

            // Should we update the last message or create new?
            // If last message is AI and NOT a dedicated Red Team bubble, update it.
            // Red Team bubble content usually starts with [RED TEAM] or [CRITIC]
            const isRedTeamBubble = lastMsg.role === 'ai' && (lastMsg.content.startsWith('[RED TEAM]') || lastMsg.content.includes('[RED TEAM]:'));

            if (lastMsg.role === 'ai' && !isRedTeamBubble) {
                newMsgs[newMsgs.length - 1] = { ...lastMsg, content: text };
                return newMsgs;
            } else {
                return [...newMsgs, { role: 'ai', content: text }];
            }
        });
    };

    const handleAgentEvent = (payload: { event: string; meta?: string }) => {
        const { event, meta } = payload;

        if (event === 'AGENT_START' && meta) {
            setAgentStatuses(prev => ({ ...prev, [meta]: 'working' }));
        } else if (event === 'AGENT_DONE' && meta) {
            setAgentStatuses(prev => ({ ...prev, [meta]: 'done' }));
        } else if (event === 'CRITIC_REPORT' && meta) {
            // Insert a special Red Team message bubble
            setMessages(prev => [...prev, { role: 'ai', content: `[RED TEAM]:\n${meta}` }]);
        } else if (event === 'AGENT_LOG' && meta) {
            setSystemStatus(meta);
        }
    };

    return (
        <div className="flex h-full bg-slate-950 overflow-hidden">
            {/* Left Main Chat Area */}
            <div className="flex-[2] flex flex-col bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800/60 relative overflow-hidden min-w-0">
                {/* New Compact Header */}
                <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Branding Cockpit</h2>
                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Strategic AI Studio V3.1 (Live)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLibrary(!showLibrary)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 text-slate-300 rounded-full transition-all text-xs font-bold group"
                        >
                            <Library className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                            <span>Projelerim</span>
                        </button>
                    </div>

                    {/* Horizontal Agents Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mask-linear-fade">
                        {AGENCY_STAFF.map(staff => (
                            <AgentAvatar
                                key={staff.id}
                                {...staff}
                                status={agentStatuses[staff.id]}
                                onClick={() => {
                                    setInput(`@${staff.id}: `);
                                    textareaRef.current?.focus();
                                }}
                            />
                        ))}
                    </div>

                    {/* System Status Log */}
                    <AnimatePresence mode="wait">
                        {systemStatus && (
                            <motion.div
                                key={systemStatus} // Key changes trigger animation
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mt-1 px-1 flex items-center gap-2 bg-slate-900/50 p-1 rounded border border-amber-500/20 max-w-full"
                            >
                                <Loader2 className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
                                <span className="text-[10px] font-mono text-amber-500/90 truncate">{systemStatus}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Brand Library Drawer Overlay */}
                <AnimatePresence>
                    {showLibrary && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0 z-50 pt-[72px]"
                        >
                            <BrandLibrary onClose={() => setShowLibrary(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tool Bar */}
                <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2 bg-slate-900/40 backdrop-blur-sm">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                    <input type="file" ref={csvInputRef} className="hidden" accept=".csv,.txt,.pdf" onChange={handleCsvSelect} />
                    <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 hover:bg-slate-700 transition-all text-xs text-slate-300 font-medium"
                        onClick={() => csvInputRef.current?.click()}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="truncate">Veri Yükle</span>
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${selectedImage ? 'bg-purple-900/40 border-purple-500 text-purple-200' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-700 text-slate-300'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="truncate">Görsel</span>
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 md:p-6 text-sm md:text-base leading-relaxed shadow-xl ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none shadow-purple-900/20'
                                : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/50 backdrop-blur-sm'
                                }`}>
                                {msg.role === 'ai' ? (
                                    /* HIDE RED TEAM MESSAGES FROM MAIN CHAT - They will be shown in the sidebar */
                                    msg.content.startsWith('[RED TEAM]') ? null : (
                                        <MessageContent content={msg.content.replace(/```json[\s\S]*?```/g, '').trim()} />
                                    )
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}
                                {msg.role === 'ai' && msg.content.includes('```json') && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-purple-300 drop-shadow-md">
                                            <Sparkles className="w-3 h-3" />
                                            STRATEJİ PLATFORMU GÜNCELLENDİ
                                        </div>
                                        <div className="flex -space-x-1">
                                            {Object.keys(ROLE_COLORS).map((role, i) => (
                                                <div key={i} className={`w-3 h-3 rounded-full border border-slate-900 ${ROLE_COLORS[role].split(' ')[1]}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800/90 text-slate-200 rounded-2xl rounded-bl-none p-4 max-w-[80%] border border-slate-700/50 shadow-2xl backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ajans Araştırıyor & Üretiyor</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-24 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse w-full"></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-purple-400 animate-pulse">STRATEJİK ANALİZ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                    {selectedImage && (
                        <div className="mb-3 relative inline-block group">
                            <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border-2 border-purple-500/50 shadow-2xl transition-transform group-hover:scale-105" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-xl transition-all"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <div className="relative flex items-end gap-3">
                        <div className="flex-1 relative flex items-center bg-slate-800/50 rounded-xl border border-slate-700/50 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all shadow-inner">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={isLoading ? "Yapay zeka analiz ediyor..." : "Markanız hakkında yazın..."}
                                disabled={isLoading}
                                className="w-full bg-transparent text-white py-3.5 px-4 pr-12 focus:outline-none disabled:opacity-50 resize-none min-h-[52px] max-h-[200px] text-sm leading-relaxed"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || (!input.trim() && !selectedImage)}
                                className="absolute right-2 bottom-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-0 shadow-lg shadow-purple-900/40 transform active:scale-95"
                            >
                                <Send className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
