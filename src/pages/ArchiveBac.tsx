import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, History as HistoryIcon, 
  Calendar, CheckCircle, ChevronLeft, 
  Grid, List, BookOpen, GraduationCap, AlertCircle, Loader2
} from 'lucide-react';

import { supabase } from '../lib/supabase';

const YEARS = Array.from({ length: 37 }, (_, i) => (2026 - i).toString());
const ITEMS_PER_PAGE = 20;

const OPTIONAL_LANGUAGES = ["Italien", "Espagnol", "Chinois", "Éducation Musicale", "Allemand"];
const SUBJECTS_BY_SECTION: Record<string, string[]> = {
  "Mathématiques": ["Mathématiques", "Physique", "Sciences Physiques", "SVT", "Arabe", "Français", "Anglais", "Philosophie", "Informatique", "Option", ...OPTIONAL_LANGUAGES],
  "Sciences Expérimentales": ["Sciences de la vie et de la terre (SVT)", "Sciences Physiques", "Mathématiques", "Arabe", "Français", "Anglais", "Philosophie", "Informatique", "Option", ...OPTIONAL_LANGUAGES],
  "Economie et Gestion": ["Économie", "Gestion", "Mathématiques", "Histoire-Géographie", "Arabe", "Français", "Anglais", "Philosophie", "Informatique", "Option", ...OPTIONAL_LANGUAGES],
  "Technique": ["Technologie", "Mathématiques", "Sciences Physiques", "Arabe", "Français", "Anglais", "Philosophie", "Informatique", "Option", ...OPTIONAL_LANGUAGES],
  "Lettres": ["Arabe", "Philosophie", "Histoire-Géographie", "Français", "Anglais", "Informatique", "Option", ...OPTIONAL_LANGUAGES],
  "Informatique": ["Algorithmes et Programmation", "Bases de Données", "TIC", "Mathématiques", "Physique", "Arabe", "Français", "Anglais", "Philosophie", ...OPTIONAL_LANGUAGES]
};
const ALL_SUBJECTS = Array.from(new Set(Object.values(SUBJECTS_BY_SECTION).flat())).sort();

const ArchiveBac = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMetaReady, setIsMetaReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // PDF Viewer State (Styled exactly like the platform)
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'exam' | 'correction'>('exam');

  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  
  // FILTERS
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState(''); 
  const [filterSubject, setFilterSubject] = useState('');
  
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [levelsRes, sectionsRes] = await Promise.all([
          supabase.from('education_levels').select('*'),
          supabase.from('sections').select('*')
        ]);

        const bacLevels = (levelsRes.data || []).filter(l => 
            l.name_fr?.toLowerCase().includes('bac') || 
            l.name?.toLowerCase().includes('bac')
        );
        setNiveaux(bacLevels);
        setSections(sectionsRes.data || []);
      } catch (e) {
        console.error("Error loading meta:", e);
      } finally {
        setIsMetaReady(true);
      }
    };
    loadMeta();
  }, []);

  const uniqueSectionsForFilter = useMemo(() => {
    const bacLevelIds = niveaux.map(n => n.id);
    const relevantSections = niveaux.length > 0 ? sections.filter(s => bacLevelIds.includes(s.education_level_id)) : sections;
    const unique = new Map();
    relevantSections.forEach(s => {
        const rawName = s.name_fr || s.name || '';
        const key = rawName.trim().toLowerCase();
        if (!key) return;
        const displayName = rawName.trim().charAt(0).toUpperCase() + rawName.trim().slice(1);
        if (!unique.has(key)) unique.set(key, displayName);
    });
    return Array.from(unique.entries()).map(([key, displayName]) => ({ key, displayName })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [sections, niveaux]);

  const availableSubjects = useMemo(() => {
    if (!filterSection) return ALL_SUBJECTS;
    const matchKey = Object.keys(SUBJECTS_BY_SECTION).find(key => filterSection.includes(key.toLowerCase()) || key.toLowerCase().includes(filterSection));
    return matchKey ? SUBJECTS_BY_SECTION[matchKey].sort() : ALL_SUBJECTS;
  }, [filterSection]);

  const fetchExams = useCallback(async (page = 1, append = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      let query = supabase
        .from('bac_archives')
        .select('id, year, subject, type, section_id, pdf_url, correction_url') 
        .order('year', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      const bacLevelIds = niveaux.map(n => n.id);
      if (bacLevelIds.length > 0) query = query.in('education_level_id', bacLevelIds);
      
      if (filterSection) {
          const matchingIds = sections.filter(s => (s.name_fr || s.name || '').trim().toLowerCase() === filterSection).map(s => s.id);
          if (matchingIds.length > 0) query = query.in('section_id', matchingIds);
          else query = query.eq('section_id', '00000000-0000-0000-0000-000000000000'); 
      }
      
      if (filterYear) query = query.eq('year', filterYear);
      if (filterSubject) query = query.ilike('subject', filterSubject);

      const { data, error } = await query;
      if (error) throw error;
      
      setExams(prev => append ? [...prev, ...(data || [])] : (data || []));
      setHasMore(data && data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Archive Fetch Error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filterYear, filterSection, filterSubject, niveaux, sections]);

  useEffect(() => {
    if (!isMetaReady) return;
    setCurrentPage(1);
    fetchExams(1, false);
  }, [isMetaReady, filterYear, filterSection, filterSubject]);

  useEffect(() => {
    if (currentPage > 1) fetchExams(currentPage, true);
  }, [currentPage]);

  const handleFilterChange = useCallback((type: 'year' | 'subject' | 'section', value: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (type === 'section') { setFilterSection(value); setFilterSubject(''); }
    else if (type === 'year') setFilterYear(value);
    else setFilterSubject(value);
    
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      setExams([]);
    }, 300);
  }, []);

  const groupedExams = useMemo(() => {
    const groups: Record<string, { year: number, subject: string, principal?: any, controle?: any }> = {};
    exams.forEach(exam => {
      const key = `${exam.year}-${exam.subject.toLowerCase().trim()}`;
      if (!groups[key]) groups[key] = { year: exam.year, subject: exam.subject };
      if (exam.type === 'Principal') groups[key].principal = exam;
      else groups[key].controle = exam;
    });
    return Object.values(groups).sort((a, b) => b.year - a.year);
  }, [exams]);

  const openViewer = (exam: any, tab: 'exam' | 'correction') => {
    setSelectedExam(exam);
    setActiveTab(tab);
  };

  const SessionButtons = ({ exam, type }: { exam: any, type: string }) => {
    if (!exam) return <span className="text-slate-300 text-xs italic font-medium">Non disponible</span>;
    const hasCorrection = exam.correction_url && exam.correction_url.length > 5;

    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => openViewer(exam, 'exam')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-[#082142] hover:text-white text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-w-[80px] justify-center"
        >
          <FileText size={14}/> Sujet
        </button>
        {hasCorrection && (
          <button 
            onClick={() => openViewer(exam, 'correction')}
            className="px-3 py-1.5 bg-green-50 hover:bg-green-600 hover:text-white text-green-600 border border-green-100 hover:border-green-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-w-[80px] justify-center"
          >
            <CheckCircle size={14}/> Corrigé
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-12 px-4 md:px-8 relative" dir="rtl">
      
      {/* PLATFORM-STYLED PDF VIEWER MODAL */}
      <AnimatePresence>
        {selectedExam && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#F5F5F7]"
          >
            <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-50 shrink-0 p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between" dir="ltr">
                
                {/* Retour Button */}
                <button 
                  onClick={() => setSelectedExam(null)} 
                  className="flex items-center gap-2 text-slate-600 font-bold hover:text-[#09d8dd] transition-colors bg-slate-100 hover:bg-[#09d8dd]/10 px-4 py-2 rounded-xl"
                >
                  <ChevronLeft size={20} />
                  <span>Retour</span>
                </button>
                
                {/* Center Title & Right Toggles */}
                <div className="flex items-center gap-4">
                   <h3 className="hidden md:block font-bold text-[#082142] text-sm">
                     {selectedExam.subject} - {selectedExam.year}
                   </h3>
                   <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                   
                   {/* Toggle Buttons */}
                   <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setActiveTab('exam')} 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'exam' ? 'bg-[#082142] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Sujet
                    </button>
                    {(selectedExam.correction_url && selectedExam.correction_url.length > 5) && (
                      <button 
                        onClick={() => setActiveTab('correction')} 
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'correction' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Correction
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
            
            {/* Native Iframe Body */}
            <div className="flex-1 w-full bg-[#f1f5f9] relative">
               {(!selectedExam.correction_url && activeTab === 'correction') ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle size={48} className="mb-4 opacity-50"/>
                      <h3 className="text-lg font-bold text-slate-600">Aucun corrigé disponible</h3>
                  </div>
               ) : (
                 <iframe 
                    key={`${selectedExam.id}-${activeTab}`}
                    src={`${activeTab === 'exam' ? selectedExam.pdf_url : selectedExam.correction_url}#view=FitH`} 
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                 />
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="text-center xl:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-[#082142] flex items-center justify-center xl:justify-start gap-3">
              <div className="p-3 bg-[#09d8dd]/10 rounded-xl text-[#09d8dd]"><HistoryIcon size={32} /></div>
              أرشيف البكالوريا
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">أكبر مكتبة لمواضيع وإصلاحات البكالوريا التونسية.</p>
          </div> 

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto" dir="ltr">
            <div className="flex flex-wrap md:flex-nowrap gap-3 flex-1 md:flex-none">
              
              <div className="relative group w-full md:w-40">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select 
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#09d8dd] outline-none transition-all appearance-none cursor-pointer text-slate-700"
                  value={filterSection}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  >
                  <option value="">Toutes Sections</option>
                  {uniqueSectionsForFilter.map((s: any) => (
                      <option key={s.key} value={s.key}>{s.displayName}</option>
                  ))}
                  </select>
              </div>

              <div className="relative group w-full md:w-32">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select 
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#09d8dd] outline-none transition-all appearance-none cursor-pointer text-slate-700"
                  value={filterYear}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">Année</option>
                  {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div className="relative group w-full md:w-48">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select 
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#09d8dd] outline-none transition-all appearance-none cursor-pointer text-slate-700"
                  value={filterSubject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                >
                  <option value="">Toutes Matières</option>
                  {availableSubjects.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl flex shrink-0">
              <button onClick={() => setViewMode('table')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white text-[#082142] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={18}/> <span className="hidden md:inline">Liste</span></button>
              <button onClick={() => setViewMode('matrix')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'matrix' ? 'bg-white text-[#082142] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={18}/> <span className="hidden md:inline">Matrice</span></button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-[2rem] border border-slate-100">
             <Loader2 size={48} className="animate-spin text-[#09d8dd]"/>
          </div>
        ) : groupedExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6"><FileText size={40} className="text-slate-300" /></div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">لا يوجد نتائج</h3>
            <p className="text-slate-500">حاول تغيير معايير البحث (السنة، الشعبة أو المادة)</p>
          </div>
        ) : (
          <div dir="ltr">
            {viewMode === 'table' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider w-24">Année</th>
                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Matière</th>
                        <th className="p-5 text-xs font-black text-[#09d8dd] uppercase tracking-wider w-64 bg-blue-50/50">Session Principale</th>
                        <th className="p-5 text-xs font-black text-amber-500 uppercase tracking-wider w-64 bg-amber-50/50">Session de Contrôle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {groupedExams.map((group, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5"><span className="font-black text-[#082142] text-lg">{group.year}</span></td>
                          <td className="p-5"><div className="font-bold text-slate-700">{group.subject}</div></td>
                          <td className="p-5 bg-blue-50/20"><SessionButtons exam={group.principal} type="Principale" /></td>
                          <td className="p-5 bg-amber-50/20"><SessionButtons exam={group.controle} type="Contrôle" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'matrix' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedExams.map((group, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl font-black text-[#082142] leading-none">{group.year}</span>
                        <div className="p-2 bg-slate-50 rounded-xl text-[#09d8dd]"><FileText size={20} /></div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 line-clamp-1">{group.subject}</h3>
                    </div>
                    <div className="flex flex-col divide-y divide-slate-50">
                      <div className="p-4 bg-blue-50/30 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Principale</span>
                        <SessionButtons exam={group.principal} type="Principale" />
                      </div>
                      <div className="p-4 bg-amber-50/30 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-600 tracking-wider">Contrôle</span>
                        <SessionButtons exam={group.controle} type="Contrôle" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  disabled={isLoadingMore}
                  className="bg-white border border-slate-200 text-[#082142] font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  {isLoadingMore ? <Loader2 size={18} className="animate-spin" /> : null}
                  Charger plus de sujets
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveBac;