import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Question } from '../db';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { QuestionView } from '../components/QuestionView';
import { QuestionNav } from '../components/QuestionNav';
import type { QuestionStatus } from '../components/QuestionNav';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';

export const ReviewExamScreen: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED'>('ALL');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const result = useLiveQuery(() =>
        resultId ? db.examResults.get(Number(resultId)) : undefined
        , [resultId]);

    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const loadQuestions = async () => {
            if (!result) return;

            if (result.questionIds && result.questionIds.length > 0) {
                const qs = await db.questions.bulkGet(result.questionIds);
                const qMap = new Map(qs.map(q => [q?.id, q]));
                const orderedQs = result.questionIds.map(id => qMap.get(id)).filter(q => !!q) as Question[];
                setQuestions(orderedQs);
            } else {
                const qs = await db.questions.where('subjectId').equals(result.subjectId).toArray();
                setQuestions(qs.slice(0, result.totalQuestions));
            }
        };
        loadQuestions();
    }, [result]);

    const getQuestionCorrectness = useCallback((q: Question): 'correct' | 'wrong' | 'unanswered' => {
        const userAns = result?.userAnswers?.[q.id!] || null;
        const isAnswered = userAns !== null && userAns !== undefined && userAns !== '';

        if (!isAnswered) return 'unanswered';

        let isCorrect = false;
        if (q.questionType === 'TRUE_FALSE_TABLE') {
            try {
                const userSub: boolean[] = JSON.parse(userAns || '[]');
                isCorrect = q.subAnswers.every((correct, idx) => userSub[idx] === correct);
            } catch { isCorrect = false; }
        } else if (q.questionType === 'MULTIPLE_CHOICE') {
            const selectedLetters = (userAns || '').split('').sort();
            const correctLetters = [...q.correctAnswers].sort();
            isCorrect = selectedLetters.length === correctLetters.length &&
                selectedLetters.every((l, i) => l === correctLetters[i]);
        } else {
            isCorrect = q.correctAnswers.includes(userAns!);
        }

        return isCorrect ? 'correct' : 'wrong';
    }, [result]);

    const filteredQuestions = questions.filter(q => {
        const status = getQuestionCorrectness(q);
        switch (filter) {
            case 'CORRECT': return status === 'correct';
            case 'WRONG': return status === 'wrong';
            case 'UNANSWERED': return status === 'unanswered';
            default: return true;
        }
    });

    const activeQuestion = filteredQuestions[currentQuestionIndex];

    const handleNavigate = useCallback((idx: number) => setCurrentQuestionIndex(idx), []);
    const swipeRef = useSwipeNavigation({
        onSwipeLeft: () => setCurrentQuestionIndex(i => Math.min(filteredQuestions.length - 1, i + 1)),
        onSwipeRight: () => setCurrentQuestionIndex(i => Math.max(0, i - 1)),
        enabled: filteredQuestions.length > 0,
    });

    const getReviewStatus = useCallback((q: any): QuestionStatus => {
        return getQuestionCorrectness(q);
    }, [getQuestionCorrectness]);

    if (!result) return <div className="p-8 text-center">Đang tải kết quả...</div>;

    const stats = [
        { label: 'Câu hỏi', value: result.totalQuestions, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Đúng', value: result.correctCount, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Sai', value: result.totalQuestions - result.correctCount, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Điểm', value: result.score.toFixed(1), color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/70 dark:bg-zinc-950/70">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-3 py-2 flex items-center gap-3 z-10 shrink-0">
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-sm truncate">{result.subjectName}</h1>
                    <p className="text-[10px] text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg font-black text-base ${result.passed !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.score.toFixed(1)}
                </div>
            </div>

            {/* Scrollable Content */}
            <div ref={swipeRef} className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                    {/* Multi-Subject Summary */}
                    {(result.isMultiSubject || (result.subjectResults && result.subjectResults.length > 0)) && (
                        <div className="space-y-2">
                            <div className={clsx(
                                "p-3 rounded-xl text-center border-2",
                                result.passed ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                            )}>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Kết Quả Chung Cuộc</p>
                                <h2 className="text-2xl font-black">{result.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}</h2>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-zinc-800">
                                <h3 className="font-bold text-sm mb-2">Chi tiết môn thi</h3>
                                <div className="space-y-1.5">
                                    {result.subjectResults?.map((sub: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                            <div className="flex-1 mr-3 min-w-0">
                                                <div className="font-bold text-xs truncate">{sub.subjectName}</div>
                                                <div className="text-[10px] text-gray-400">
                                                    {sub.correctCount}/{sub.totalQuestions} câu đúng
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-sm text-gray-900 dark:text-gray-100">{sub.score.toFixed(1)}</span>
                                                <span className={clsx(
                                                    "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                                                    sub.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {sub.passed ? 'ĐẠT' : 'RỚT'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {stats.map((stat, i) => (
                            <div key={i} className={clsx("p-3 rounded-2xl flex flex-col items-center justify-center gap-1", stat.bg)}>
                                <span className={clsx("font-black text-lg", stat.color)}>{stat.value}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {[
                            { key: 'ALL', label: 'Tất cả' },
                            { key: 'CORRECT', label: 'Đúng', icon: CheckCircle, color: 'text-green-600' },
                            { key: 'WRONG', label: 'Sai', icon: XCircle, color: 'text-red-600' },
                            { key: 'UNANSWERED', label: 'Chưa làm', icon: HelpCircle, color: 'text-gray-600' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => {
                                    setFilter(f.key as any);
                                    setCurrentQuestionIndex(0);
                                }}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                                    filter === f.key
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white dark:bg-zinc-900 text-gray-500 border border-gray-100 dark:border-zinc-800"
                                )}
                            >
                                {f.icon && <f.icon size={12} />}
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Question Review Area */}
                    {filteredQuestions.length > 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Câu {(activeQuestion?.id ? questions.findIndex(q => q.id === activeQuestion.id) : 0) + 1} / {questions.length}
                                </span>
                            </div>

                            {activeQuestion && (
                                <QuestionView
                                    question={activeQuestion}
                                    selectedAnswer={result?.userAnswers?.[activeQuestion.id!] || null}
                                    selectedSubAnswers={(() => {
                                        // First try userSubAnswers (new format)
                                        const sub = result?.userSubAnswers?.[activeQuestion.id!];
                                        if (sub && Array.isArray(sub) && sub.length > 0) return sub;
                                        // Fallback: parse from userAnswers (TRUE_FALSE_TABLE stores JSON strings there)
                                        if (activeQuestion.questionType === 'TRUE_FALSE_TABLE') {
                                            try { return JSON.parse(result?.userAnswers?.[activeQuestion.id!] || '[]'); } catch { return []; }
                                        }
                                        return [];
                                    })()}
                                    showResult={true}
                                    onAnswer={() => { }}
                                    onSubAnswer={() => { }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl">
                            <p className="text-gray-400 text-sm">Không có câu hỏi nào trong mục này</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            {filteredQuestions.length > 0 && (
                <QuestionNav
                    questions={filteredQuestions}
                    currentIndex={currentQuestionIndex}
                    onNavigate={handleNavigate}
                    getStatus={getReviewStatus}
                />
            )}
        </div>
    );
};
