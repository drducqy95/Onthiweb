import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import { clsx } from 'clsx';

export type QuestionStatus = 'answered' | 'correct' | 'wrong' | 'unanswered' | null;

interface QuestionNavProps {
    questions: { id?: number; content: string }[];
    currentIndex: number;
    onNavigate: (index: number) => void;
    getStatus?: (question: any, index: number) => QuestionStatus;
}

const statusConfig: Record<string, { dot: string; bg: string; label: string }> = {
    answered: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800', label: 'Đã trả lời' },
    correct: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800', label: 'Đúng' },
    wrong: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800', label: 'Sai' },
    unanswered: { dot: 'bg-gray-300 dark:bg-zinc-600', bg: 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700', label: 'Chưa làm' },
};

// Strip HTML tags and trim content for display
function stripContent(html: string, maxLen = 60): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
    questions,
    currentIndex,
    onNavigate,
    getStatus,
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const activeRef = useRef<HTMLButtonElement>(null);

    // Scroll active item into view when drawer opens
    useEffect(() => {
        if (drawerOpen && activeRef.current) {
            activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [drawerOpen]);

    const total = questions.length;
    if (total === 0) return null;

    return (
        <>
            {/* Drawer Overlay */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col justify-end animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setDrawerOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-t-[1.5rem] shadow-2xl max-h-[65vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                            <h3 className="font-bold text-sm">Danh sách câu hỏi</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {currentIndex + 1}/{total}
                                </span>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Question List */}
                        <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1">
                            {questions.map((q, idx) => {
                                const status = getStatus ? getStatus(q, idx) : null;
                                const cfg = status ? statusConfig[status] : null;
                                const isActive = idx === currentIndex;

                                return (
                                    <button
                                        key={q.id ?? idx}
                                        ref={isActive ? activeRef : undefined}
                                        onClick={() => {
                                            onNavigate(idx);
                                            setDrawerOpen(false);
                                        }}
                                        className={clsx(
                                            'w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all active:scale-[0.98]',
                                            isActive
                                                ? 'bg-primary/10 border-2 border-primary/30 ring-1 ring-primary/20'
                                                : cfg
                                                    ? `border ${cfg.bg}`
                                                    : 'border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                                        )}
                                    >
                                        {/* STT Badge */}
                                        <div
                                            className={clsx(
                                                'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black',
                                                isActive
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                                            )}
                                        >
                                            {idx + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx(
                                                'text-xs leading-relaxed line-clamp-2',
                                                isActive ? 'font-bold text-primary' : 'text-gray-700 dark:text-gray-300'
                                            )}>
                                                {stripContent(q.content)}
                                            </p>
                                        </div>

                                        {/* Status Dot */}
                                        {cfg && (
                                            <div className={clsx('shrink-0 w-2.5 h-2.5 rounded-full mt-1', cfg.dot)} title={cfg.label} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Bar */}
            <div className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-3 py-2 flex items-center gap-2 z-10">
                <button
                    onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 transition-all active:scale-95"
                >
                    <ChevronLeft size={18} /> Trước
                </button>

                {/* Center: List button with counter */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                    <List size={16} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-500">
                        {currentIndex + 1} / {total}
                    </span>
                </button>

                <button
                    onClick={() => onNavigate(Math.min(total - 1, currentIndex + 1))}
                    disabled={currentIndex === total - 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-primary text-white shadow-md shadow-primary/30 disabled:opacity-40 transition-all active:scale-95"
                >
                    Sau <ChevronRight size={18} />
                </button>
            </div>
        </>
    );
};
