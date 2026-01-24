import { AlertTriangle } from 'lucide-react';

export default function RedTeamSidebar({ messages }: { messages: string[] }) {
    if (!messages || messages.length === 0) return null;

    // Get the latest critique
    const latestCritique = messages[messages.length - 1].replace(/^\[RED TEAM\]:\s*/, '').trim();

    return (
        <div className="bg-red-950/20 border-l border-red-900/50 h-full p-4 overflow-y-auto w-[300px] hidden xl:flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 pb-4 border-b border-red-900/30">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Kritik Riskler</h3>
                    <span className="text-[10px] text-red-400/60 font-mono">CANLI DENETİM MODÜLÜ</span>
                </div>
            </div>

            <div className="prose prose-sm prose-invert prose-red">
                <p className="text-xs text-red-300 leading-relaxed font-medium">
                    {latestCritique}
                </p>
            </div>
        </div>
    );
}
