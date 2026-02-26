import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  List,
  Grid3X3,
  CheckCircle,
  AlertCircle,
  X,
  LayoutGrid,
  LayoutList,
  Loader,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Menu,
  Home,
  Calendar as CalendarIcon,
  Info,
  Users,
  GraduationCap,
  Shield,
  Building2,
  Phone,
  Mail,
  Star,
  Sparkles,
  Heart,
  Zap,
  Trophy,
  Target,
  Sun,
  Moon,
  Coffee,
  Play,
  Award,
  Activity,
  Clipboard
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday, isWithinInterval } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string; 
  type: 'class' | 'exam' | 'activity' | 'holiday';
  grade: string;
  group: string;
  section?: string;
}

interface ClassInfo {
  grade: string;
  group: string;
  section?: string;
  password: string;
}

interface LoginFormData {
  grade: string;
  group: string;
  section?: string;
  password: string;
}

interface ClassCredential {
  grade: string;
  group: string;
  section?: string;
  password: string;
}

// Tunisian month names
const tunisianMonths = {
  'January': 'جانفي',
  'February': 'فيفري',
  'March': 'مارس',
  'April': 'أفريل',
  'May': 'ماي',
  'June': 'جوان',
  'July': 'جويلية',
  'August': 'أوت',
  'September': 'سبتمبر',
  'October': 'أكتوبر',
  'November': 'نوفمبر',
  'December': 'ديسمبر'
};

// Tunisian day names
const tunisianDays = {
  'Sunday': 'الأحد',
  'Monday': 'الإثنين',
  'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء',
  'Thursday': 'الخميس',
  'Friday': 'الجمعة',
  'Saturday': 'السبت'
};

// Grade options for the form (French values, Arabic labels)
const gradeOptions = [
  { value: '1ère année primaire', label: 'السنة الأولى ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '🌟' },
  { value: '2ème année primaire', label: 'السنة الثانية ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '🎨' },
  { value: '3ème année primaire', label: 'السنة الثالثة ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '🚀' },
  { value: '4ème année primaire', label: 'السنة الرابعة ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '⭐' },
  { value: '5ème année primaire', label: 'السنة الخامسة ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '🎯' },
  { value: '6ème année primaire', label: 'السنة السادسة ابتدائي', color: 'from-cyan-400 to-blue-500', emoji: '🏆' },
  { value: '7ème année collège', label: 'السنة السابعة إعدادي', color: 'from-cyan-400 to-blue-500', emoji: '🎓' },
  { value: '8ème année collège', label: 'السنة الثامنة إعدادي', color: 'from-cyan-400 to-blue-500', emoji: '📚' },
  { value: '9ème année collège', label: 'السنة التاسعة إعدادي', color: 'from-cyan-400 to-blue-500', emoji: '🌈' },
  { value: '1ère année lycée', label: 'السنة الأولى ثانوي', color: 'from-cyan-400 to-blue-500', emoji: '🎪' },
  { value: '2ème année lycée', label: 'السنة الثانية ثانوي', color: 'from-cyan-400 to-blue-500', emoji: '🎭' },
  { value: '3ème année lycée', label: 'السنة الثالثة ثانوي', color: 'from-cyan-400 to-blue-500', emoji: '🎬' },
  { value: 'Baccalauréat', label: 'البكالوريا', color: 'from-cyan-400 to-blue-500', emoji: '👑' }
];

// Section options for the form (French values, Arabic labels)
const sectionOptions = {
  '2ème année lycée': [
    { value: 'Sciences', label: 'علوم', color: 'from-cyan-400 to-blue-500', emoji: '🔬' },
    { value: 'Sciences Techniques', label: 'تقنية', color: 'from-cyan-400 to-blue-500', emoji: '⚙️' },
    { value: 'Lettres', label: 'آداب', color: 'from-cyan-400 to-blue-500', emoji: '📖' },
    { value: 'Économie', label: 'اقتصاد', color: 'from-cyan-400 to-blue-500', emoji: '💰' }
  ],
  '3ème année lycée': [
    { value: 'Sciences', label: 'علوم', color: 'from-cyan-400 to-blue-500', emoji: '🔬' },
    { value: 'Sciences Techniques', label: 'تقنية', color: 'from-cyan-400 to-blue-500', emoji: '⚙️' },
    { value: 'Lettres', label: 'آداب', color: 'from-cyan-400 to-blue-500', emoji: '📖' },
    { value: 'Économie', label: 'اقتصاد', color: 'from-cyan-400 to-blue-500', emoji: '💰' }
  ],
  'Baccalauréat': [
    { value: 'Sciences expérimentales', label: 'علوم تجريبية', color: 'from-cyan-400 to-blue-500', emoji: '🧪' },
    { value: 'Mathématiques', label: 'رياضيات', color: 'from-cyan-400 to-blue-500', emoji: '📐' },
    { value: 'Économie et gestion', label: 'اقتصاد وتصرف', color: 'from-cyan-400 to-blue-500', emoji: '📊' },
    { value: 'Lettres', label: 'آداب', color: 'from-cyan-400 to-blue-500', emoji: '✍️' },
    { value: 'Informatique', label: 'إعلامية', color: 'from-cyan-400 to-blue-500', emoji: '💻' },
    { value: 'Sciences Techniques', label: 'تقنية', color: 'from-cyan-400 to-blue-500', emoji: '🔧' }
  ]
};

// Function to generate class credentials (EXACTLY the same as in AdminPage)
const generateClassCredentials = (): ClassCredential[] => {
  const grades = [
    '1ère année primaire',
    '2ème année primaire',
    '3ème année primaire',
    '4ème année primaire',
    '5ème année primaire',
    '6ème année primaire',
    '7ème année collège',
    '8ème année collège',
    '9ème année collège',
    '1ère année lycée',
    '2ème année lycée',
    '3ème année lycée',
    'Baccalauréat'
  ];
  
  const secondYearSections = [
    'Sciences',
    'Sciences Techniques',
    'Lettres',
    'Économie'
  ];

  const thirdYearSections = [
    'Sciences',
    'Sciences Techniques',
    'Lettres',
    'Économie'
  ];
  
  const bacSections = [
    'Sciences expérimentales',
    'Mathématiques',
    'Économie et gestion',
    'Lettres',
    'Informatique',
    'Sciences Techniques'
  ];
  
  const credentials: ClassCredential[] = [];
  
  grades.forEach((grade, gradeIndex) => {
    const gradeId = gradeIndex + 1;
    
    // For grades that don't have sections
    if (!grade.includes('2ème année lycée') && !grade.includes('3ème année lycée') && !grade.includes('Baccalauréat')) {
      for (let groupNum = 1; groupNum <= 10; groupNum++) {
        const group = groupNum.toString();
        const password = `mb${gradeId}${group}`;
        
        credentials.push({
          grade,
          group,
          password
        });
      }
    } 
    // For 2ème année lycée with sections
    else if (grade.includes('2ème année lycée')) {
      for (let groupNum = 1; groupNum <= 10; groupNum++) {
        const group = groupNum.toString();
        
        secondYearSections.forEach(section => {
          const sectionCode = section.substring(0, 1).toLowerCase();
          const password = `mb${gradeId}${group}${sectionCode}`;
          
          credentials.push({
            grade,
            group,
            section,
            password
          });
        });
      }
    }
    // For 3ème année lycée with sections
    else if (grade.includes('3ème année lycée')) {
      for (let groupNum = 1; groupNum <= 10; groupNum++) {
        const group = groupNum.toString();
        
        thirdYearSections.forEach(section => {
          const sectionCode = section.substring(0, 1).toLowerCase();
          const password = `mb${gradeId}${group}${sectionCode}`;
          
          credentials.push({
            grade,
            group,
            section,
            password
          });
        });
      }
    }
    // For Bac with sections
    else if (grade.includes('Baccalauréat')) {
      for (let groupNum = 1; groupNum <= 10; groupNum++) {
        const group = groupNum.toString();
        
        bacSections.forEach(section => {
          let sectionCode = '';
          if (section === 'Sciences expérimentales') sectionCode = 'se';
          else if (section === 'Mathématiques') sectionCode = 'm';
          else if (section === 'Économie et gestion') sectionCode = 'eg';
          else if (section === 'Lettres') sectionCode = 'l';
          else if (section === 'Informatique') sectionCode = 'i';
          else if (section === 'Sciences Techniques') sectionCode = 't';
          
          const password = `mb${gradeId}${group}${sectionCode}`;
          
          credentials.push({
            grade,
            group,
            section,
            password
          });
        });
      }
    }
  });
  
  return credentials;
};

const CalendarPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    grade: '',
    group: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'today' | 'upcoming'>('schedule');
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const navigate = useNavigate();
  
  // Load class credentials from localStorage (same key as AdminPage)
  const [classCredentials, setClassCredentials] = useState<ClassCredential[]>(() => {
    const stored = localStorage.getItem('classCredentials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing class credentials from localStorage:', error);
      }
    }
    // Generate new credentials with the same function as AdminPage
    return generateClassCredentials();
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing authentication
        const isCalendarAuthenticated = localStorage.getItem('calendarAuthenticated') === 'true';
        const savedClassInfo = localStorage.getItem('calendarClassInfo');
        
        if (isCalendarAuthenticated && savedClassInfo) {
          try {
            const parsedClassInfo = JSON.parse(savedClassInfo);
            
            // Verify the data is complete
            if (parsedClassInfo && parsedClassInfo.grade && parsedClassInfo.group) {
              setIsLoggedIn(true);
              setClassInfo(parsedClassInfo);
              await fetchEvents(parsedClassInfo.grade, parsedClassInfo.group, parsedClassInfo.section);
              return;
            } else {
              // Data is incomplete, clear it
              localStorage.removeItem('calendarAuthenticated');
              localStorage.removeItem('calendarClassInfo');
            }
          } catch (error) {
            console.error('Error parsing class info:', error);
            localStorage.removeItem('calendarAuthenticated');
            localStorage.removeItem('calendarClassInfo');
          }
        }
        
        // If we get here, no valid auth found
        setIsLoggedIn(false);
        setClassInfo(null);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsLoggedIn(false);
        setClassInfo(null);
      }
    };
    
    initializeApp();
  }, []);

  const logCalendarAccess = async (grade: string, group: string, section?: string) => {
    try {
      const { error } = await supabase
        .from('calendar_access_logs')
        .insert([{ grade, group, section }]);
      
      if (error) {
        console.error('Error logging calendar access:', error);
      }
    } catch (error) {
      console.error('Error in logCalendarAccess:', error);
    }
  };

  const fetchEvents = async (grade: string, group: string, section?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('grade', grade)
        .eq('group', group);
        
      // If section is provided, add it to the query
      if (section) {
        query = query.eq('section', section);
      }
      
      const { data, error } = await query.order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      setEvents(data || []);
      
      // Calculate upcoming events (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcoming = data?.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      }) || [];
      
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, clear any old data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('calendar') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    setIsLoading(true);
    setLoginError('');
    
    const { grade, group, section, password } = loginForm;
    
    // Check if the credentials match any class
    const validClass = classCredentials.find(
      c => c.grade === grade && 
           c.group === group && 
           (c.section || '') === (section || '') && 
           c.password === password
    );
    
    if (validClass) {
      setIsLoggedIn(true);
      setClassInfo({
        grade: validClass.grade,
        group: validClass.group,
        section: validClass.section,
        password: validClass.password
      });
      
      // Store authentication state
      localStorage.setItem('calendarAuthenticated', 'true');
      localStorage.setItem('calendarClassInfo', JSON.stringify({
        grade: validClass.grade,
        group: validClass.group,
        section: validClass.section,
        password: validClass.password
      }));
      
      // Log the access
      await logCalendarAccess(validClass.grade, validClass.group, validClass.section);
      
      // Fetch events for this class
      await fetchEvents(validClass.grade, validClass.group, validClass.section);
    } else {
      setLoginError('بيانات الدخول غير صحيحة. يرجى التحقق من المعلومات والمحاولة مرة أخرى.');
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoggedIn(false);
    setClassInfo(null);
    setLoginForm({
      grade: '',
      group: '',
      password: ''
    });
    setEvents([]);
    // Clear authentication state
    localStorage.removeItem('calendarAuthenticated');
    localStorage.removeItem('calendarClassInfo');
    
    setIsLoggingOut(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      setSelectedDateEvents(dayEvents);
      setShowEventModal(true);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Create a local date from the event.date string (YYYY-MM-DD)
      const eventDate = new Date(event.date + 'T00:00:00');
      return isSameDay(eventDate, date);
    });
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return 'from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-200';
      case 'exam': return 'from-red-400 to-pink-400 text-white shadow-lg shadow-red-200';
      case 'activity': return 'from-green-400 to-emerald-400 text-white shadow-lg shadow-green-200';
      case 'holiday': return 'from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200';
      default: return 'from-gray-400 to-slate-400 text-white shadow-lg shadow-gray-200';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return <BookOpen className="w-5 h-5" />;
      case 'exam': return <Trophy className="w-5 h-5" />;
      case 'activity': return <Play className="w-5 h-5" />;
      case 'holiday': return <Sun className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventEmoji = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return '📚';
      case 'exam': return '🏆';
      case 'activity': return '🎯';
      case 'holiday': return '🌞';
      default: return '📅';
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeOption = gradeOptions.find(g => g.value === grade);
    return gradeOption?.color || 'from-cyan-400 to-blue-500';
  };

  const getGradeEmoji = (grade: string) => {
    const gradeOption = gradeOptions.find(g => g.value === grade);
    return gradeOption?.emoji || '📖';
  };

  const renderEventModal = () => (
    <AnimatePresence>
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    أنشطة يوم {format(selectedDate, 'EEEE', { locale: arSA })}
                  </h3>
                  <p className="text-cyan-100 text-sm mt-1">
                    {format(selectedDate, 'd MMMM yyyy', { locale: arSA })}
                  </p>
                </div>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {selectedDateEvents.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${getEventColor(event.type)} transform hover:scale-105 transition-all duration-200`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getEventEmoji(event.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                      <div className="space-y-1 text-sm opacity-90">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-3 text-sm bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderMobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 md:hidden z-40 shadow-2xl">
      <div className="flex justify-around py-3">
        {[
          { key: 'schedule', icon: CalendarIcon, label: 'الجدول', color: 'text-cyan-500' },
          { key: 'today', icon: Sun, label: 'اليوم', color: 'text-amber-500' },
          { key: 'upcoming', icon: Zap, label: 'القادمة', color: 'text-green-500' },
          { key: 'menu', icon: Menu, label: 'المزيد', color: 'text-blue-500' }
        ].map(({ key, icon: Icon, label, color }) => (
          <button
            key={key}
            onClick={() => key === 'menu' ? setMobileMenuOpen(!mobileMenuOpen) : setActiveTab(key as any)}
            className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all transform hover:scale-105 ${
              activeTab === key ? `${color} bg-gradient-to-t from-white to-gray-50 shadow-lg` : 'text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <motion.div 
            className="absolute bottom-20 left-4 right-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getGradeColor(classInfo?.grade || '')} p-6 text-white`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getGradeEmoji(classInfo?.grade || '')}</div>
                  <div>
                    <h3 className="text-lg font-bold">{gradeOptions.find(g => g.value === classInfo?.grade)?.label}</h3>
                    <p className="text-white/80 text-sm">المجموعة {classInfo?.group} {classInfo?.section && `- ${classInfo.section}`}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setViewMode('calendar');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all transform hover:scale-105 ${
                    viewMode === 'calendar' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="font-medium">التقويم</span>
                </button>
                
                <button
                  onClick={() => {
                    setViewMode('list');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all transform hover:scale-105 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LayoutList className="w-5 h-5" />
                  <span className="font-medium">القائمة</span>
                </button>
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Format month name in Tunisian way
    const monthName = format(currentDate, 'MMMM');
    const tunisianMonthName = tunisianMonths[monthName as keyof typeof tunisianMonths] || monthName;
    
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📅</div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {tunisianMonthName} {format(currentDate, 'yyyy')}
              </h2>
              <p className="text-gray-500 text-sm">انقر على أي يوم لعرض الأنشطة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
              title="اليوم"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Object.values(tunisianDays).map((day) => (
            <div key={day} className="text-center text-sm font-bold text-gray-600 py-3 bg-gray-50 rounded-xl">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <motion.div 
                key={index}
                onClick={() => onDateClick(day)}
                className={`
                  min-h-24 p-3 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden transform hover:scale-105
                  ${isSameMonth(day, currentDate) ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                  ${isToday ? 'ring-4 ring-amber-400 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-2 border-gray-100'}
                  ${isSelected ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300' : ''}
                  hover:shadow-xl hover:border-cyan-300
                `}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Date Number */}
                <div className="text-right font-bold text-lg mb-2 flex justify-between items-center">
                  <span>{format(day, 'd')}</span>
                  {isToday && <span className="text-amber-500">✨</span>}
                </div>
                
                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: eventIndex * 0.1 }}
                      className={`text-xs px-2 py-1 rounded-lg bg-gradient-to-r ${getEventColor(event.type)} truncate font-medium shadow-sm`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getEventEmoji(event.type)}</span>
                        <span>{event.title}</span>
                      </div>
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-center bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg py-1 font-medium">
                      +{dayEvents.length - 2} المزيد
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventList = () => {
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.startTime);
      const dateB = new Date(b.date + ' ' + b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
    
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📋</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              جدول الأنشطة
            </h2>
            <p className="text-gray-500 text-sm">جميع أنشطتك مرتبة حسب التاريخ</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 animate-pulse">جاري تحميل الأنشطة...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😴</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد أنشطة مجدولة</h3>
            <p className="text-gray-500">استمتع بوقت فراغك!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl bg-gradient-to-r ${getEventColor(event.type)} transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventEmoji(event.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{format(parseISO(event.date), 'EEEE d MMMM yyyy', { locale: arSA })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTodayEvents = () => {
    const today = new Date();
    const todayEvents = getEventsForDate(today);
    
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">🌟</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              أنشطة اليوم
            </h2>
            <p className="text-gray-500 text-sm">
              {format(today, 'EEEE d MMMM yyyy', { locale: arSA })}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 animate-pulse">جاري تحميل أنشطة اليوم...</p>
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎈</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد أنشطة لليوم</h3>
            <p className="text-gray-500">يوم مثالي للاسترخاء!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-2xl bg-gradient-to-r ${getEventColor(event.type)} transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventEmoji(event.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">⚡</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              الأنشطة القادمة
            </h2>
            <p className="text-gray-500 text-sm">الأسبوع القادم</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 animate-pulse">جاري تحميل الأنشطة القادمة...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد أنشطة قادمة</h3>
            <p className="text-gray-500">استعد للمغامرات القادمة!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-2xl bg-gradient-to-r ${getEventColor(event.type)} transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventEmoji(event.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{format(parseISO(event.date), 'EEEE d MMMM yyyy', { locale: arSA })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedDateEvents = () => {
    const selectedEvents = getEventsForDate(selectedDate);
    const isToday = isSameDay(selectedDate, new Date());
    
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{isToday ? '🎯' : '📍'}</div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                {isToday ? 'اليوم المحدد' : 'اليوم المحدد'}
              </h2>
              <p className="text-gray-500 text-sm">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: arSA })}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
            title="اليوم"
          >
            <CalendarDays className="w-5 h-5" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 text-sm animate-pulse">جاري التحميل...</p>
          </div>
        ) : selectedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🌤️</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">يوم هادئ</h3>
            <p className="text-gray-500 text-sm">لا توجد أنشطة مجدولة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-2xl bg-gradient-to-r ${getEventColor(event.type)} transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getEventEmoji(event.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLogin = () => (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 p-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-3xl">🎓</div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              أوقات MBSchool
            </h1>
            <p className="text-gray-600 text-sm">مرحباً بك في جدولك الدراسي التفاعلي</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>📚</span>
                الصف الدراسي
              </label>
              <select
                name="grade"
                value={loginForm.grade}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm bg-white/80 backdrop-blur-sm"
                required
              >
                <option value="">اختر الصف الدراسي</option>
                {gradeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Group Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>👥</span>
                المجموعة
              </label>
              <select
                name="group"
                value={loginForm.group}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm bg-white/80 backdrop-blur-sm"
                required
              >
                <option value="">اختر المجموعة</option>
                {Array.from({ length: 10 }, (_, i) => (i + 1).toString()).map(group => (
                  <option key={group} value={group}>المجموعة {group}</option>
                ))}
              </select>
            </div>
            
            {/* Section Selection */}
            {(loginForm.grade === '2ème année lycée' || 
              loginForm.grade === '3ème année lycée' || 
              loginForm.grade === 'Baccalauréat') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  القسم
                </label>
                <select
                  name="section"
                  value={loginForm.section || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm bg-white/80 backdrop-blur-sm"
                  required={loginForm.grade === '2ème année lycée' || 
                          loginForm.grade === '3ème année lycée' || 
                          loginForm.grade === 'Baccalauréat'}
                >
                  <option value="">اختر القسم</option>
                  {sectionOptions[loginForm.grade as keyof typeof sectionOptions]?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>🔐</span>
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm bg-white/80 backdrop-blur-sm"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {loginError && (
              <motion.div 
                className="text-red-600 text-sm bg-red-50 p-3 rounded-2xl border border-red-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              </motion.div>
            )}
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  دخول إلى جدولي
                </>
              )}
            </button>
          </form>
          
          {/* Footer Info */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-sm text-gray-600 font-medium mb-2">للحصول على كلمة المرور</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span dir="ltr">27 208 090</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span dir="ltr">contact@mbschool.tn</span>
                </div>
              </div>
            </div>
            
            {/* Reset Button */}
            <button 
              onClick={() => {
                // Clear all stored data
                Object.keys(localStorage).forEach(key => {
                  if (key.includes('supabase') || key.includes('calendar') || key.includes('auth')) {
                    localStorage.removeItem(key);
                  }
                });
                // Reset class credentials
                const newCredentials = generateClassCredentials();
                localStorage.setItem('classCredentials', JSON.stringify(newCredentials));
                window.location.reload();
              }}
              className="mt-4 text-sm text-red-500 hover:text-red-700 underline font-medium flex items-center justify-center gap-2"
            > 
              <RefreshCw className="w-4 h-4" />
              هل تواجه مشاكل في تسجيل الدخول؟ إعادة ضبط
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderCalendarPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-xl">🎓</div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  أوقات MBSchool
                </h1>
                <p className="text-gray-500 text-sm">جدولك التفاعلي</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right bg-white/50 rounded-2xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getGradeEmoji(classInfo?.grade || '')}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {gradeOptions.find(g => g.value === classInfo?.grade)?.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      المجموعة {classInfo?.group} {classInfo?.section && `- ${classInfo.section}`}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-medium shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>خروج</span> 
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-lg border border-white/50">
            <div className="text-3xl">🌟</div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                مرحباً بك!
              </h2>
              <p className="text-gray-600 text-sm">استعرض جدولك واستعد لمغامرات التعلم</p>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Navigation for Desktop */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="inline-flex rounded-3xl bg-white/80 backdrop-blur-sm p-2 border border-white/50 shadow-lg">
            {[
              { key: 'schedule', icon: CalendarIcon, label: 'الجدول', color: 'from-cyan-400 to-blue-500', emoji: '📅' },
              { key: 'today', icon: Sun, label: 'اليوم', color: 'from-amber-500 to-orange-500', emoji: '☀️' },
              { key: 'upcoming', icon: Zap, label: 'القادمة', color: 'from-green-500 to-teal-500', emoji: '⚡' }
            ].map(({ key, icon: Icon, label, color, emoji }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3 rounded-2xl transition-all text-sm font-bold flex items-center gap-3 transform hover:scale-105 ${
                  activeTab === key 
                    ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* View Mode Toggle - Only visible when in schedule tab */}
        {activeTab === 'schedule' && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-sm p-1 border border-white/50 shadow-lg">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-3 rounded-xl transition-all text-sm font-bold flex items-center gap-2 transform hover:scale-105 ${
                  viewMode === 'calendar' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>التقويم</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all text-sm font-bold flex items-center gap-2 transform hover:scale-105 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>القائمة</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'schedule' && (viewMode === 'calendar' ? renderCalendar() : renderEventList())}
            {activeTab === 'today' && renderTodayEvents()}
            {activeTab === 'upcoming' && renderUpcomingEvents()}
          </div>
          <div className="order-first lg:order-last">
            {renderSelectedDateEvents()}
          </div>
        </div>
        
        {/* Quick Tips Card */}
        <motion.div 
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg">
                <Info className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                نصائح مفيدة
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span>🎯</span>
                  انقر على أي يوم في التقويم لعرض تفاصيل الأنشطة
                </li>
                <li className="flex items-center gap-2">
                  <span>🔄</span>
                  استخدم أزرار التنقل للتبديل بين العروض المختلفة
                </li>
                <li className="flex items-center gap-2">
                  <span>⚡</span>
                  يتم تحديث الجدول تلقائياً مع الأنشطة الجديدة
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Mobile Navigation */}
      {renderMobileNavigation()}
      
      {/* Mobile Menu */}
      {renderMobileMenu()}
      
      {/* Event Modal */}
      {renderEventModal()}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoggedIn ? renderCalendarPage() : renderLogin()}
    </AnimatePresence>
  );
};

export default CalendarPage;