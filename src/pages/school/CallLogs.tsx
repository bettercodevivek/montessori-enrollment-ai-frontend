import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Phone, Loader2, MessageSquare, Play, Pause, Clock,
    Calendar, ChevronDown, User, Bot, Headphones, Download
} from 'lucide-react';
import api from '../../api/axios';

interface TranscriptItem {
    role: string;
    text: string;
    timestamp?: string;
}

interface CallLogData {
    id: string;
    sessionId: string;
    participantId: string;
    transcript: TranscriptItem[];
    summary: string;
    recordingUrl: string;
    duration: number;
    createdAt: string;
}

const AudioPlayer = ({ src }: { src: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current || error) return;
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current || !progressBarRef.current || error) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        audioRef.current.currentTime = percentage * audioRef.current.duration;
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 w-full ${error ? 'opacity-75' : ''}`}>
            <audio
                ref={audioRef} src={src}
                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => {
                    if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                        setLoading(false);
                    }
                }}
                onCanPlay={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
                onEnded={() => setIsPlaying(false)}
                hidden
            />

            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={togglePlay}
                    disabled={error || loading}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all shrink-0 ${error ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                </button>
                <div className="flex-1">
                    {error ? (
                        <div className="h-7 flex items-center justify-center text-[10px] font-semibold text-red-500 bg-red-50 rounded italic">
                            Recording unavailable or still processing
                        </div>
                    ) : (
                        <>
                            <div ref={progressBarRef} onClick={handleSeek} className="h-1.5 bg-slate-200 rounded-full cursor-pointer relative">
                                <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[10px] font-bold text-slate-400">{formatTime(currentTime)}</span>
                                <span className="text-[10px] font-bold text-slate-400">{formatTime(duration)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                    <Headphones className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                        {error ? 'Error loading audio' : 'Recording Console'}
                    </span>
                </div>
                {!error && !loading && (
                    <a href={src} download className="text-slate-400 hover:text-blue-600">
                        <Download className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </div>
    );
};

export const SchoolCallLogs = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<CallLogData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/school/call-logs');
                setLogs(res.data);
            } catch (err) {
                console.error('Failed to load call logs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const toggleExpand = (id: string | null) => setExpandedId(expandedId === id ? null : id);

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.round(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-6 px-4">
            <div className="mb-8 flex items-baseline justify-between border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('call_logs')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('dashboard_desc')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Sync</p>
                    <p className="text-xs font-bold text-emerald-500">Live Active</p>
                </div>
            </div>

            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className={`bg-white border rounded-2xl transition-all ${expandedId === log.id ? 'border-blue-500 shadow-xl' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>
                        <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(log.id)}>
                            <div className="flex items-center gap-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedId === log.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-slate-900">{log.participantId.replace('sip_', '')}</span>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(log.createdAt).toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.createdAt).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[11px] font-bold text-blue-600">
                                            {formatDuration(log.duration)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedId === log.id ? 'rotate-180 text-blue-600' : 'text-slate-300'}`} />
                        </div>

                        {expandedId === log.id && (
                            <div className="p-6 pt-2 bg-slate-50/30 border-t border-slate-50 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Summary & Audio */}
                                    <div className="lg:col-span-4 space-y-4">
                                        <AudioPlayer src={log.recordingUrl} />
                                        {log.summary && (
                                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1 h-3 bg-blue-600 rounded-full" />
                                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('ai_insights')}</h3>
                                                </div>
                                                <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic">"{log.summary}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Complete Transcript */}
                                    <div className="lg:col-span-8 flex flex-col">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Conversation Transcript</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">
                                                {log.transcript.length} UTTERANCES
                                            </span>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 max-h-[450px] overflow-y-auto custom-scrollbar shadow-inner">
                                            {log.transcript.length > 0 ? (
                                                <div className="space-y-4">
                                                    {log.transcript.map((msg, idx) => {
                                                        const isAI = msg.role.toLowerCase().includes('assistant') || msg.role.toLowerCase().includes('ai') || msg.role === 'Mia';
                                                        return (
                                                            <div key={idx} className="flex gap-4 group">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isAI ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                                    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAI ? 'text-blue-600' : 'text-slate-900'}`}>
                                                                            {isAI ? t('mia_assistant') : t('caller')}
                                                                        </span>
                                                                        {msg.timestamp && (
                                                                            <span className="text-[9px] font-bold text-slate-300">{msg.timestamp}</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[13px] text-slate-700 leading-relaxed">{msg.text}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-20 text-center">
                                                    <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transcript data found</p>
                                                    <p className="text-[11px] text-slate-400 mt-1">This may be due to an active session still processing.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
