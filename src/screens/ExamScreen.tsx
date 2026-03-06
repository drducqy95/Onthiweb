import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { QuestionView } from '../components/QuestionView';
import { QuestionNav } from '../components/QuestionNav';
import type { QuestionStatus } from '../components/QuestionNav';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { ChevronLeft, Timer, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExamStore, useSettingsStore } from '../store';
import { clsx } from 'clsx';


export const ExamScreen: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const { shuffleQuestions } = useSettingsStore();
    const {
        currentSession,
        startSession,
        updateAnswer,
        decrementTime,
        finishSession,
        completeSubject,
        clearSession
    } = useExamStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNextSubjectModal, setShowNextSubjectModal] = useState(false);
    const [lastSubjectResult, setLastSubjectResult] = useState<any>(null);

    // Initialization Logic for Legacy/Direct Link
    useEffect(() => {
        const initLegacySession = async () => {
            if (!currentSession && subjectId) {
                setIsLoading(true);
                const id = Number(subjectId);
                const subject = await db.subjects.get(id);
                if (!subject) {
                    alert('Môn học không tồn tại');
                    navigate('/exam');
                    return;
                }

                const qs = await db.getQuestionsBySubjectRecursive(id);
                let finalQs = qs;
                if (shuffleQuestions) {
                    finalQs = qs.sort(() => Math.random() - 0.5);
                }
                finalQs = finalQs.slice(0, 40);

                startSession(
                    `Thi thử: ${subject.name}`,
                    [{ subjectId: id, subjectName: subject.name, count: finalQs.length, time: 40 }],
                    finalQs
                );
                setIsLoading(false);
            } else if (!currentSession && !subjectId) {
                navigate('/exam');
            }
        };

        initLegacySession();
    }, [subjectId, currentSession, navigate, startSession, shuffleQuestions]);

    // Timer Logic
    useEffect(() => {
        if (!currentSession || currentSession.isFinished || currentSession.isPaused || showNextSubjectModal) return;

        const timer = setInterval(() => {
            decrementTime();
        }, 1000);

        return () => clearInterval(timer);
    }, [currentSession, decrementTime, showNextSubjectModal]);

    // Auto-Submit on Timeout
    useEffect(() => {
        if (currentSession && currentSession.timeLeft === 0 && !currentSession.isFinished && !showNextSubjectModal) {
            handleSubmit(true);
        }
    }, [currentSession?.timeLeft]);

    // Identify Active Subject and Questions
    const activeSubjectIndex = currentSession?.accumulatedResults?.length || 0;
    const activeConfig = currentSession?.configs[activeSubjectIndex];

    // Slice questions for active subject
    const getActiveQuestions = () => {
        if (!currentSession || !activeConfig) return [];
        let start = 0;
        for (let i = 0; i < activeSubjectIndex; i++) {
            start += currentSession.configs[i].count;
        }
        return currentSession.questions.slice(start, start + activeConfig.count);
    };

    const activeQuestions = getActiveQuestions();
    const currentQuestion = activeQuestions[currentIndex];

    if (isLoading || !currentSession || !activeConfig || !currentQuestion) {
        return <div className="p-8 text-center">Đang tải câu hỏi...</div>;
    }

    const { userAnswers, timeLeft } = currentSession;

    // Handle Answer — multi-select toggle for MULTIPLE_CHOICE
    const handleAnswer = (letter: string) => {
        if (currentSession.isFinished || showNextSubjectModal) return;

        if (currentQuestion.questionType === 'MULTIPLE_CHOICE') {
            const current = userAnswers[currentQuestion.id!] || '';
            if (current.includes(letter)) {
                updateAnswer(currentQuestion.id!, current.replace(letter, ''));
            } else {
                const newVal = (current + letter).split('').sort().join('');
                updateAnswer(currentQuestion.id!, newVal);
            }
        } else {
            updateAnswer(currentQuestion.id!, letter);
        }
    };

    const handleSubAnswer = (idx: number, val: boolean) => {
        if (currentSession.isFinished || showNextSubjectModal) return;
        let currentSub: boolean[] = [];
        try {
            currentSub = JSON.parse(userAnswers[currentQuestion.id!] || '[]');
        } catch { }

        if (!currentSub.length) currentSub = Array(currentQuestion.subQuestions?.length || 0).fill(null);

        currentSub[idx] = val;
        updateAnswer(currentQuestion.id!, JSON.stringify(currentSub));
    };

    const handleSubmit = async (auto = false) => {
        if (!auto && !window.confirm('Bạn có chắc chắn muốn nộp bài môn này?')) return;

        let correctCount = 0;
        let totalItems = 0;

        activeQuestions.forEach(q => {
            if (q.questionType === 'TRUE_FALSE_TABLE') {
                let userSub: boolean[] = [];
                try { userSub = JSON.parse(userAnswers[q.id!] || '[]'); } catch { }
                q.subAnswers.forEach((correct, idx) => {
                    totalItems++;
                    if (userSub[idx] === correct) correctCount++;
                });
            } else {
                totalItems++;
                const userA = userAnswers[q.id!] || '';
                if (q.questionType === 'MULTIPLE_CHOICE') {
                    const selectedLetters = userA.split('').sort();
                    const correctLetters = [...q.correctAnswers].sort();
                    const isExact = selectedLetters.length === correctLetters.length &&
                        selectedLetters.every((l, i) => l === correctLetters[i]);
                    if (isExact) correctCount++;
                } else {
                    if (q.correctAnswers.includes(userA)) correctCount++;
                }
            }
        });

        const score = totalItems > 0 ? (correctCount / totalItems) * 10 : 0;
        const passed = totalItems > 0 ? (correctCount / totalItems) >= 0.7 : false;

        const result = {
            subjectId: activeConfig.subjectId,
            subjectName: activeConfig.subjectName,
            score,
            correctCount,
            totalQuestions: totalItems,
            passed
        };

        completeSubject(result);

        if (activeSubjectIndex < currentSession.configs.length - 1) {
            setLastSubjectResult(result);
            setShowNextSubjectModal(true);
            setCurrentIndex(0);
        } else {
            finishAll([...(currentSession.accumulatedResults || []), result]);
        }
    };

    const finishAll = async (allResults: any[]) => {
        finishSession();

        const globalPassed = allResults.every(r => r.passed);
        const totalScore = allResults.reduce((acc, r) => acc + r.score, 0);
        const avgScore = totalScore / allResults.length;

        const resultId = await db.examResults.add({
            subjectId: currentSession.configs[0].subjectId,
            subjectName: currentSession.name,
            score: avgScore,
            correctCount: allResults.reduce((acc, r) => acc + r.correctCount, 0),
            totalQuestions: allResults.reduce((acc, r) => acc + r.totalQuestions, 0),
            timestamp: Date.now(),
            sessionId: currentSession.sessionId,
            examName: currentSession.name,
            questionIds: currentSession.questions.map(q => q.id!),
            userAnswers: userAnswers,
            userSubAnswers: {},
            isMultiSubject: true,
            subjectResults: allResults,
            passed: globalPassed
        });

        clearSession();
        navigate(`/review/${resultId}`, { replace: true });
    };

    const startNextSubject = () => {
        setShowNextSubjectModal(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleNavigate = useCallback((idx: number) => setCurrentIndex(idx), []);
    const swipeRef = useSwipeNavigation({
        onSwipeLeft: () => setCurrentIndex(i => Math.min(activeQuestions.length - 1, i + 1)),
        onSwipeRight: () => setCurrentIndex(i => Math.max(0, i - 1)),
    });

    const getExamStatus = useCallback((q: any): QuestionStatus => {
        return userAnswers[q.id!] ? 'answered' : 'unanswered';
    }, [userAnswers]);

    // Modal for Next Subject
    if (showNextSubjectModal) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Hoàn thành môn thi!</h3>
                    <p className="text-xl font-black text-primary mb-4">{activeConfig.subjectName}</p>

                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Điểm số</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{lastSubjectResult?.score.toFixed(1)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Số câu đúng</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{lastSubjectResult?.correctCount}/{lastSubjectResult?.totalQuestions}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startNextSubject}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-all"
                    >
                        Thi môn tiếp theo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/70 dark:bg-zinc-950/70">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-3 flex items-center justify-between shadow-sm z-20">
                <button onClick={() => setShowExitConfirm(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl">
                    <ChevronLeft size={24} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded">
                        {activeConfig.subjectName} ({activeSubjectIndex + 1}/{currentSession.configs.length})
                    </span>
                    <div className={clsx("flex items-center gap-2 font-mono font-bold text-lg", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-900 dark:text-gray-100")}>
                        <Timer size={18} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <button
                    onClick={() => handleSubmit()}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                    NỘP BÀI
                </button>
            </div>

            {/* Content */}
            <div ref={swipeRef} className="flex-1 overflow-y-auto px-3 py-2">
                <div className="max-w-2xl mx-auto" key={currentQuestion.id}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        <span>Câu {currentIndex + 1} / {activeConfig.count}</span>
                    </div>

                    <QuestionView
                        question={currentQuestion}
                        selectedAnswer={userAnswers[currentQuestion.id!] || null}
                        selectedSubAnswers={(() => {
                            try { return JSON.parse(userAnswers[currentQuestion.id!] || '[]'); } catch { return []; }
                        })()}
                        showResult={false}
                        onAnswer={handleAnswer}
                        onSubAnswer={handleSubAnswer}
                    />
                </div>
            </div>

            {/* Footer */}
            <QuestionNav
                questions={activeQuestions}
                currentIndex={currentIndex}
                onNavigate={handleNavigate}
                getStatus={getExamStatus}
            />

            {/* Exit Confirm */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold">Thoát bài thi?</h3>
                            <p className="text-gray-500">Kết quả bài làm sẽ bị hủy bỏ.</p>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button onClick={() => setShowExitConfirm(false)} className="p-3 bg-gray-100 rounded-xl font-bold text-gray-700">Ở lại</button>
                                <button onClick={() => { clearSession(); navigate('/exam'); }} className="p-3 bg-red-500 text-white rounded-xl font-bold">Thoát</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
