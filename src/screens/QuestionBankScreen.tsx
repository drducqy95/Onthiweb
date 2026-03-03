import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Plus, Search, Filter, ChevronRight, Folder } from 'lucide-react';
import { ImportModal } from '../components/ImportModal';
import { SubjectTree } from '../components/SubjectTree';
import { useSettingsStore } from '../store';

export const QuestionBankScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useSettingsStore();

    // Filters
    const [filterExamTerm, setFilterExamTerm] = useState('Tất cả');
    const [filterLevel, setFilterLevel] = useState('Tất cả');
    const [filterType, setFilterType] = useState('Tất cả');
    const [showOnlyRoot, setShowOnlyRoot] = useState(true);

    const allSubjects = useLiveQuery(() => db.subjects.toArray()) || [];

    // Live property options from DB (real-time sync with PropertySettingsScreen)
    const propExamTerms = useLiveQuery(() => db.propertyOptions.where('type').equals('term').toArray()) || [];
    const propLevels = useLiveQuery(() => db.propertyOptions.where('type').equals('level').toArray()) || [];
    const propTypes = useLiveQuery(() => db.propertyOptions.where('type').equals('type').toArray()) || [];

    // Merge: property DB options + unique values from existing subjects (dedup)
    const uniqueExamTerms = useMemo(() => Array.from(new Set([
        ...propExamTerms.map(p => p.name),
        ...allSubjects.map(s => s.examTerm).filter(Boolean)
    ])), [allSubjects, propExamTerms]);
    const uniqueLevels = useMemo(() => Array.from(new Set([
        ...propLevels.map(p => p.name),
        ...allSubjects.map(s => s.level).filter(Boolean)
    ])), [allSubjects, propLevels]);
    const uniqueTypes = useMemo(() => Array.from(new Set([
        ...propTypes.map(p => p.name),
        ...allSubjects.map(s => s.type).filter(Boolean)
    ])), [allSubjects, propTypes]);

    // Filter Logic
    const filteredSubjects = useMemo(() => {
        return allSubjects.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesExamTerm = filterExamTerm === 'Tất cả' || s.examTerm === filterExamTerm;
            const matchesLevel = filterLevel === 'Tất cả' || s.level === filterLevel;
            const matchesType = filterType === 'Tất cả' || s.type === filterType;
            const matchesRoot = showOnlyRoot && !searchQuery ? s.parentId === null : true;
            return matchesSearch && matchesExamTerm && matchesLevel && matchesType && matchesRoot;
        });
    }, [allSubjects, searchQuery, filterExamTerm, filterLevel, filterType, showOnlyRoot]);

    const isFiltering = searchQuery !== '' || filterExamTerm !== 'Tất cả' || filterLevel !== 'Tất cả' || filterType !== 'Tất cả';

    const dropdownClass = `px-3 py-2 rounded-xl text-xs font-bold border outline-none focus:border-primary appearance-none ${darkMode ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-700 border-gray-200'}`;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold italic">Ngân Hàng</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 active:scale-95 transition-transform"
                    >
                        <Plus size={20} className="text-primary" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm bộ đề..."
                    className="w-full p-4 pl-12 rounded-[1.5rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm outline-none focus:ring-2 ring-primary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1">
                <button
                    onClick={() => setShowOnlyRoot(!showOnlyRoot)}
                    className={`flex items-center px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition shrink-0 ${showOnlyRoot
                        ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-white dark:text-black'
                        : 'bg-white text-gray-600 border-gray-200 dark:bg-zinc-900 dark:text-gray-400 dark:border-zinc-800'
                        }`}
                >
                    <Filter className="w-3 h-3 mr-1" /> {showOnlyRoot ? 'Môn gốc' : 'Tất cả'}
                </button>

                <select value={filterExamTerm} onChange={(e) => setFilterExamTerm(e.target.value)} className={dropdownClass}>
                    <option value="Tất cả">Kỳ thi: Tất cả</option>
                    {uniqueExamTerms.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={dropdownClass}>
                    <option value="Tất cả">Cấp độ: Tất cả</option>
                    {uniqueLevels.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={dropdownClass}>
                    <option value="Tất cả">Loại: Tất cả</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Content: Tree or Flat List */}
            {!isFiltering ? (
                <SubjectTree
                    subjects={allSubjects}
                    enableMenu={true}
                    onSelect={(subject) => {
                        navigate(`/bank/${subject.id}`);
                    }}
                />
            ) : (
                <div className="space-y-3">
                    {filteredSubjects.length === 0 ? (
                        <div className="text-center py-10 opacity-50 flex flex-col items-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p>Không tìm thấy bộ đề nào phù hợp</p>
                        </div>
                    ) : (
                        filteredSubjects.map(subject => (
                            <div
                                key={subject.id}
                                onClick={() => navigate(`/bank/${subject.id}`)}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
                                        <Folder size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm line-clamp-1">{subject.name}</h4>
                                        <div className="flex gap-2 items-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                            <span>{subject.level}</span>
                                            <span>•</span>
                                            <span>{subject.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </div>
                        ))
                    )}
                </div>
            )}

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};
