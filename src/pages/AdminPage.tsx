import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { 

  LogOut, Save, Trash2, Edit, Plus, Calendar, CalendarDays,

  Clock, MapPin, BookOpen, ChevronLeft, ChevronRight,

  CheckCircle, AlertCircle, Search, Filter, X, Eye, EyeOff,

  Download, Upload, Settings, BarChart3, FileText, Layers,

  UserCheck, Loader, MoreVertical, Users, TrendingUp, PieChart,

  Activity, Calendar as CalendarIcon, Users as UsersIcon, 

  BarChart2, RefreshCw, ChevronDown, ChevronUp, Star, Bell,

  Grid, List, ArrowUp, ArrowDown, ExternalLink, Shield, Copy

} from 'lucide-react';

import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

import { fr } from 'date-fns/locale';

import { supabase } from '../lib/supabase';

import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';


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
  course?: string;
}

interface AdminCredentials {
  username: string;
  password: string;
}

interface ClassCredential {
  grade: string;
  group: string;
  section?: string;
  password: string;
  // Add this new property to track multiple courses
  courses?: string[]; // Array of course IDs or names
}

interface CalendarAccessLog {
  id: string;
  grade: string;
  group: string;
  section?: string;
  accessed_at: string;
}

type ActiveTab = 'events' | 'dashboard' | 'settings' | 'pupils' | 'statistics';
type DateRange = 'today' | 'week' | 'month' | 'custom';
type StatView = 'daily' | 'weekly' | 'monthly';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState<AdminCredentials>({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [eventForm, setEventForm] = useState<Omit<CalendarEvent, 'id'>>({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  type: 'class',
  grade: '',
  group: '',
  section: '',
  course: '' // Add this line
});
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formSection, setFormSection] = useState<'basic' | 'details' | 'classification'>('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventsToShow, setEventsToShow] = useState(6);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsError, setSettingsError] = useState('');
  
  // Admin credentials state
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    const stored = localStorage.getItem('adminCredentials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing admin credentials from localStorage:', error);
      }
    }
    return { username: 'admin', password: 'mbschool2025' };
  });
  
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
    'Économie',
    'Informatique'  // This was missing
  ];
  
  const thirdYearSections = [
    'Sciences',
    'Sciences Techniques',
    'Lettres',
    'Économie',
    'Mathématiques',  // This was missing
    'Informatique'    // This was missing
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

  const exportClassCredentials = () => {
  const csvContent = [
    ['Classe', 'Groupe', 'Section', 'Mot de passe'],
    ...classCredentials.map(cred => [
      cred.grade,
      cred.group,
      cred.section || '',
      cred.password
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `class_credentials_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setNotification({ type: 'success', message: 'Les identifiants de classe ont été exportés avec succès' });
};
  // Class credentials state
  const [classCredentials, setClassCredentials] = useState<ClassCredential[]>(() => {
    const stored = localStorage.getItem('classCredentials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing class credentials from localStorage:', error);
      }
    }
    // Generate new credentials with groups 1-10
    return generateClassCredentials();
  });
  
  // Pupil management state
  const [editingCredential, setEditingCredential] = useState<{
    index: number;
    grade: string;
    group: string;
    section?: string;
    password: string;
  } | null>(null);
  
const [newCredential, setNewCredential] = useState<{
  grade: string;
  group: string;
  section?: string;
  password: string;
  courses?: string[];
}>({
  grade: '',
  group: '',
  password: '',
  courses: []
});
  
  // Search state for pupils
  const [pupilSearchTerm, setPupilSearchTerm] = useState('');
  const [filteredPupils, setFilteredPupils] = useState<ClassCredential[]>([]);
  
  // State for dropdowns in class list
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});
  
  // Statistics state
  const [accessLogs, setAccessLogs] = useState<CalendarAccessLog[]>([]);
  const [statView, setStatView] = useState<StatView>('daily');
  const [statDateRange, setStatDateRange] = useState<DateRange>('week');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: format(subWeeks(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [statGrade, setStatGrade] = useState('');
  const [statGroup, setStatGroup] = useState('');
  const [statSection, setStatSection] = useState('');
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statData, setStatData] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  
  // Initialize settings form when admin credentials change
  useEffect(() => {
    setSettingsForm({
      username: adminCredentials.username,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [adminCredentials]);
  
  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Fetch access logs for statistics
  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchAccessLogs();
    }
  }, [activeTab, statDateRange, customDateRange, statGrade, statGroup, statSection]);
  
  // Filter pupils based on search term
  useEffect(() => {
    if (pupilSearchTerm.trim() === '') {
      setFilteredPupils(classCredentials);
    } else {
      const term = pupilSearchTerm.toLowerCase();
      const filtered = classCredentials.filter(credential => 
        credential.grade.toLowerCase().includes(term) ||
        credential.group.toLowerCase().includes(term) ||
        (credential.section && credential.section.toLowerCase().includes(term)) ||
        credential.password.toLowerCase().includes(term)
      );
      setFilteredPupils(filtered);
    }
  }, [pupilSearchTerm, classCredentials]);
  
  // Initialize filtered pupils
  useEffect(() => {
    setFilteredPupils(classCredentials);
  }, [classCredentials]);
  
  // Update visible events when filteredEvents changes
  useEffect(() => {
    setVisibleEvents(filteredEvents.slice(0, eventsToShow));
  }, [filteredEvents, eventsToShow]);
  
  // Grades and groups for filtering
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
  
  const groups = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  const secondYearSections = [
      'Sciences',
      'Sciences Techniques',
      'Lettres',
      'Économie',
      'Informatique'
  ];
  
  const thirdYearSections = [
      'Sciences',
      'Sciences Techniques',
      'Lettres',
      'Économie',
       'Mathématiques',
      'Informatique'
  ];
  
  const bacSections = [
    'Sciences expérimentales',
    'Mathématiques',
    'Économie et gestion',
    'Lettres',
    'Informatique',
    'Sciences Techniques'
  ];
  
useEffect(() => {
  const initializeAdmin = async () => {
    try {
      // Check if admin is logged in
      const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      
      if (isAdminLoggedIn) {
        setIsLoggedIn(true);
        await fetchEvents();
      } else {
        // Clear any leftover admin data
        Object.keys(localStorage).forEach(key => {
          if (key.includes('admin') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Admin initialization error:', error);
      // Clear any corrupted data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('admin') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      setIsLoggedIn(false);
    }
  };
  
  initializeAdmin();
}, []);  
  useEffect(() => {
    // Filter events based on selected grade, group, and section
    let filtered = [...events];
    
    if (selectedGrade) {
      filtered = filtered.filter(event => event.grade === selectedGrade);
    }
    
    if (selectedGroup) {
      filtered = filtered.filter(event => event.group === selectedGroup);
    }
    
    if (selectedSection) {
      filtered = filtered.filter(event => event.section === selectedSection);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        
        switch (dateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return eventDate >= today && eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }
    
    setFilteredEvents(filtered);
    setVisibleEvents(filtered.slice(0, eventsToShow));
  }, [events, selectedGrade, selectedGroup, selectedSection, searchTerm, dateRange, eventsToShow]);
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        setNotification({ type: 'error', message: 'Échec de récupération des événements' });
        return;
      }
      
      setEvents(data || []);
      setFilteredEvents(data || []);
      setVisibleEvents((data || []).slice(0, eventsToShow));
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
    }
  };
  
  const fetchAccessLogs = async () => {
    setIsLoadingStats(true);
    try {
      let query = supabase
        .from('calendar_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false });
      
      // Apply date filters
      let startDate, endDate;
      const now = new Date();
      
      switch (statDateRange) {
        case 'today':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          endDate = endOfWeek(now, { weekStartsOn: 0 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'custom':
          startDate = new Date(customDateRange.start);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
      
      if (startDate && endDate) {
        query = query.gte('accessed_at', startDate.toISOString()).lte('accessed_at', endDate.toISOString());
      }
      
      // Apply class filters
      if (statGrade) query = query.eq('grade', statGrade);
      if (statGroup) query = query.eq('group', statGroup);
      if (statSection) query = query.eq('section', statSection);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching access logs:', error);
        setNotification({ type: 'error', message: 'Échec de récupération des données statistiques' });
        return;
      }
      
      setAccessLogs(data || []);
      processStatisticsData(data || []);
    } catch (error) {
      console.error('Error in fetchAccessLogs:', error);
      setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  const processStatisticsData = (logs: CalendarAccessLog[]) => {
    // Process data for the main chart
    const groupedData: Record<string, number> = {};
    
    logs.forEach(log => {
      const date = new Date(log.accessed_at);
      let key;
      
      switch (statView) {
        case 'daily':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          const weekStart = startOfWeek(date, { weekStartsOn: 0 });
          key = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'monthly':
          key = format(date, 'yyyy-MM');
          break;
      }
      
      groupedData[key] = (groupedData[key] || 0) + 1;
    });
    
    const chartData = Object.keys(groupedData).map(key => {
      let label;
      const date = new Date(key);
      
      switch (statView) {
        case 'daily':
          label = format(date, 'dd/MM', { locale: fr });
          break;
        case 'weekly':
          label = `Semaine ${format(date, 'dd/MM', { locale: fr })}`;
          break;
        case 'monthly':
          label = format(date, 'MMMM yyyy', { locale: fr });
          break;
      }
      
      return {
        name: label,
        accesses: groupedData[key],
        date: key
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setStatData(chartData);
    
    // Process data for grade distribution
    const gradeCounts: Record<string, number> = {};
    logs.forEach(log => {
      const key = `${log.grade} - ${log.group}${log.section ? ` - ${log.section}` : ''}`;
      gradeCounts[key] = (gradeCounts[key] || 0) + 1;
    });
    
    const distributionData = Object.keys(gradeCounts).map(grade => ({
      name: grade,
      value: gradeCounts[grade]
    }));
    
    setGradeDistribution(distributionData);
  };
  
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Clear any old data first
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('admin') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  
  setIsSubmitting(true);
  setLoginError('');
  
  const { username, password } = loginForm;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (username === adminCredentials.username && password === adminCredentials.password) {
    setIsLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
    fetchEvents();
  } else {
    setLoginError('Identifiants de connexion incorrects');
  }
  
  setIsSubmitting(false);
};
  
const handleLogout = async () => {
  setIsLoggingOut(true);
  
  // Simulate logout process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  setIsLoggedIn(false);
  setLoginForm({
    username: '',
    password: ''
  });
  
  // Clear all admin and Supabase data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('admin') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  
  setIsLoggingOut(false);
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Settings handlers
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSettingsSubmit = async () => {
    setIsSubmitting(true);
    setSettingsError('');
    
    try {
      // Validate current password
      if (settingsForm.currentPassword !== adminCredentials.password) {
        setSettingsError('Le mot de passe actuel est incorrect');
        setIsSubmitting(false);
        return;
      }
      
      // Validate new password
      if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
        setSettingsError('Les nouveaux mots de passe ne correspondent pas');
        setIsSubmitting(false);
        return;
      }
      
      // Update credentials
      const updatedCredentials = {
        username: settingsForm.username || adminCredentials.username,
        password: settingsForm.newPassword || adminCredentials.password
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state and localStorage
      setAdminCredentials(updatedCredentials);
      localStorage.setItem('adminCredentials', JSON.stringify(updatedCredentials));
      
      // Reset form
      setSettingsForm({
        username: updatedCredentials.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setNotification({ type: 'success', message: 'Le compte a été mis à jour avec succès' });
    } catch (error) {
      console.error('Error updating settings:', error);
      setSettingsError('Une erreur s\'est produite lors de la mise à jour des données');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate classification fields
      if (!eventForm.grade || !eventForm.group) {
        setNotification({ type: 'error', message: 'La classe et le groupe sont requis' });
        return;
      }
      
      // For Bac, second year and third year secondary, section is required
      if ((eventForm.grade === '2ème année lycée' || eventForm.grade === '3ème année lycée' || eventForm.grade === 'Baccalauréat') && !eventForm.section) {
        setNotification({ type: 'error', message: 'La section est requise pour cette classe' });
        return;
      }
      
      // Prepare the data for submission
      const submitData = { ...eventForm };
      
      // Remove section if not needed for this grade
      if (eventForm.grade !== '2ème année lycée' && eventForm.grade !== '3ème année lycée' && eventForm.grade !== 'Baccalauréat') {
        delete submitData.section;
      }
      
      if (isEditing && selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from('schedules')
          .update(submitData)
          .eq('id', selectedEvent.id);
        
        if (error) {
          console.error('Error updating event:', error);
          setNotification({ type: 'error', message: 'Échec de la mise à jour de l\'événement' });
          return;
        }
        
        setNotification({ type: 'success', message: 'L\'événement a été mis à jour avec succès' });
      } else {
        // Add new event
        const { error } = await supabase
          .from('schedules')
          .insert([submitData]);
        
        if (error) {
          console.error('Error adding event:', error);
          setNotification({ type: 'error', message: 'Échec de l\'ajout de l\'événement' });
          return;
        }
        
        setNotification({ type: 'success', message: 'L\'événement a été ajouté avec succès' });
      }
      
      // Reset form and fetch updated events
      setEventForm({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        type: 'class',
        grade: '',
        group: '',
        section: ''
      });
      setIsEditing(false);
      setSelectedEvent(null);
      setIsFormOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      type: event.type,
      grade: event.grade,
      group: event.group,
      section: event.section || ''
    });
    setIsEditing(true);
    setFormSection('basic');
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setEventToDelete(id);
    
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting event:', error);
        setNotification({ type: 'error', message: 'Échec de la suppression de l\'événement' });
        return;
      }
      
      setNotification({ type: 'success', message: 'L\'événement a été supprimé avec succès' });
      fetchEvents();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };
  const handleDuplicateEvent = async (event: CalendarEvent) => {
  try {
    // Create a copy of the event without the ID
    const { id, ...eventCopy } = event;
    
    // Add "Copy" to the title
    eventCopy.title = `${eventCopy.title} (Copie)`;
    
    // Insert the duplicated event
    const { error } = await supabase
      .from('schedules')
      .insert([eventCopy]);
    
    if (error) {
      console.error('Error duplicating event:', error);
      setNotification({ type: 'error', message: 'Échec de la duplication de l\'événement' });
      return;
    }
    
    setNotification({ type: 'success', message: 'L\'événement a été dupliqué avec succès' });
    fetchEvents();
  } catch (error) {
    console.error('Error in handleDuplicateEvent:', error);
    setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
  }
};
  
  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .in('id', selectedEvents);
      
      if (error) {
        console.error('Error bulk deleting events:', error);
        setNotification({ type: 'error', message: 'Échec de la suppression des événements' });
        return;
      }
      
      setNotification({ type: 'success', message: `${selectedEvents.length} événements ont été supprimés avec succès` });
      setSelectedEvents([]);
      setShowBulkActions(false);
      fetchEvents();
    } catch (error) {
      console.error('Error in handleBulkDelete:', error);
      setNotification({ type: 'error', message: 'Une erreur inattendue s\'est produite' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a CSV string
      const headers = ['Titre', 'Date', 'Heure de début', 'Heure de fin', 'Lieu', 'Description', 'Type', 'Classe', 'Groupe', 'Section'];
      const csvContent = [
        headers.join(','),
        ...events.map(event => [
          event.title,
          event.date,
          event.startTime,
          event.endTime,
          event.location || '',
          event.description || '',
          event.type === 'class' ? 'Cours' : 
          event.type === 'exam' ? 'Examen' : 
          event.type === 'activity' ? 'Activité' : 'Vacances',
          event.grade,
          event.group,
          event.section || ''
        ].join(','))
      ].join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `events_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({ type: 'success', message: 'Les données ont été exportées avec succès' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({ type: 'error', message: 'Échec de l\'exportation des données' });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsImporting(true);
    
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',');
          
          // Skip header line
          const eventsToImport = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            
            const eventData: any = {
              title: values[0]?.trim() || '',
              date: values[1]?.trim() || '',
              startTime: values[2]?.trim() || '',
              endTime: values[3]?.trim() || '',
              location: values[4]?.trim() || '',
              description: values[5]?.trim() || '',
              type: values[6]?.trim() === 'Cours' ? 'class' : 
                    values[6]?.trim() === 'Examen' ? 'exam' : 
                    values[6]?.trim() === 'Activité' ? 'activity' : 'holiday',
              grade: values[7]?.trim() || '',
              group: values[8]?.trim() || ''
            };
            
            // Only add section if it's provided and the grade requires it
            if (values[9]?.trim() && (
              eventData.grade === '2ème année lycée' ||
              eventData.grade === '3ème année lycée' || 
              eventData.grade === 'Baccalauréat'
            )) {
              eventData.section = values[9]?.trim();
            }
            
            eventsToImport.push(eventData);
          }
          
          // Insert events in batches
          const batchSize = 50;
          for (let i = 0; i < eventsToImport.length; i += batchSize) {
            const batch = eventsToImport.slice(i, i + batchSize);
            const { error } = await supabase
              .from('schedules')
              .insert(batch);
            
            if (error) {
              console.error('Error importing batch:', error);
              setNotification({ type: 'error', message: 'Échec de l\'importation des données' });
              return;
            }
          }
          
          setNotification({ type: 'success', message: `${eventsToImport.length} événements ont été importés avec succès` });
          fetchEvents();
        } catch (error) {
          console.error('Error processing CSV:', error);
          setNotification({ type: 'error', message: 'Échec du traitement du fichier' });
        } finally {
          setIsImporting(false);
          // Reset file input
          e.target.value = '';
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
      setNotification({ type: 'error', message: 'Échec de l\'importation des données' });
      setIsImporting(false);
    }
  };
  
  const resetForm = () => {
    setEventForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      type: 'class',
      grade: '',
      group: '',
      section: ''
    });
    setIsEditing(false);
    setSelectedEvent(null);
    setIsFormOpen(false);
  };
  
  const toggleEventSelection = (id: string) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter(eventId => eventId !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };
  
  const loadMoreEvents = () => {
    setEventsToShow(prev => prev + 6);
  };
  
  // Function to refresh class credentials
  const refreshClassCredentials = () => {
    const newCredentials = generateClassCredentials();
    setClassCredentials(newCredentials);
    localStorage.setItem('classCredentials', JSON.stringify(newCredentials));
    setNotification({ type: 'success', message: 'Les identifiants de classe ont été actualisés avec succès' });
  };
  
  // Function to toggle grade expansion in dropdown
  const toggleGradeExpansion = (grade: string) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };
  
  // Function to expand all grades
  const expandAllGrades = () => {
    const allExpanded: Record<string, boolean> = {};
    grades.forEach(grade => {
      allExpanded[grade] = true;
    });
    setExpandedGrades(allExpanded);
  };
  
  // Function to collapse all grades
  const collapseAllGrades = () => {
    setExpandedGrades({});
  };
  
  // Pupil management functions
  const saveCredentials = (credentials: ClassCredential[]) => {
    localStorage.setItem('classCredentials', JSON.stringify(credentials));
    setClassCredentials(credentials);
  };
  
  const handleEditCredential = (index: number) => {
    const credential = classCredentials[index];
    setEditingCredential({
      index,
      grade: credential.grade,
      group: credential.group,
      section: credential.section,
      password: credential.password
    });
  };
  
  const handleUpdateCredential = () => {
    if (!editingCredential) return;
    
    const updatedCredentials = [...classCredentials];
    updatedCredentials[editingCredential.index] = {
      grade: editingCredential.grade,
      group: editingCredential.group,
      section: editingCredential.section,
      password: editingCredential.password
    };
    
    saveCredentials(updatedCredentials);
    setEditingCredential(null);
    setNotification({ type: 'success', message: 'Le mot de passe a été mis à jour avec succès' });
  };
  
  const handleDeleteCredential = (index: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      const updatedCredentials = [...classCredentials];
      updatedCredentials.splice(index, 1);
      saveCredentials(updatedCredentials);
      setNotification({ type: 'success', message: 'La classe a été supprimée avec succès' });
    }
  };
  
  const handleAddCredential = () => {
    if (!newCredential.grade || !newCredential.group || !newCredential.password) {
      setNotification({ type: 'error', message: 'Tous les champs sont requis' });
      return;
    }
    
    const credentialToAdd: ClassCredential = {
      grade: newCredential.grade,
      group: newCredential.group,
      password: newCredential.password
    };
    
    if (newCredential.section) {
      credentialToAdd.section = newCredential.section;
    }
    
    saveCredentials([...classCredentials, credentialToAdd]);
    setNewCredential({
      grade: '',
      group: '',
      password: ''
    });
    setNotification({ type: 'success', message: 'La classe a été ajoutée avec succès' });
  };
  
  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return 'text-blue-600';
      case 'exam': return 'text-red-600';
      case 'activity': return 'text-green-600';
      case 'holiday': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };
  
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return <BookOpen className="w-5 h-5" />;
      case 'exam': return <Clock className="w-5 h-5" />;
      case 'activity': return <Calendar className="w-5 h-5" />;
      case 'holiday': return <MapPin className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };
  
  const getEventBadgeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'activity': return 'bg-green-100 text-green-800';
      case 'holiday': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderNotification = () => (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
            notification.type === 'success' 
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' 
              : 'bg-red-50/95 border-red-200 text-red-800'
          }`}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
const renderLogin = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 ltr admin-page">
    <div className="w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
      >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-[#132943] to-blue-700 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration MBSchool</h1>
            <p className="text-gray-600">Tableau de bord sécurisé</p>
            
            {/* ADD THIS RESET BUTTON */}
            <button 
              onClick={() => {
                // Clear all admin and Supabase data
                Object.keys(localStorage).forEach(key => {
                  if (key.includes('supabase') || key.includes('admin') || key.includes('auth')) {
                    localStorage.removeItem(key);
                  } 
                });
                window.location.reload();
              }}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Problèmes de connexion ? Cliquez ici pour réinitialiser.
            </button>
            {/* END OF RESET BUTTON */}
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={loginForm.username}
                onChange={handleLoginInputChange}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white/50 backdrop-blur-sm text-sm placeholder-gray-400"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white/50 backdrop-blur-sm text-sm pr-12 placeholder-gray-400"
                  placeholder="Entrez votre mot de passe"
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
            
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-200"
              >
                {loginError}
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#132943] to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold hover:from-[#1a3152] hover:to-blue-800 focus:ring-4 focus:ring-[#132943]/20 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5 mr-2" />
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Système sécurisé - Accès autorisé uniquement
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
  
  const renderDashboard = () => {
    // Calculate statistics
    const totalEvents = events.length;
    const eventsByType = {
      class: events.filter(e => e.type === 'class').length,
      exam: events.filter(e => e.type === 'exam').length,
      activity: events.filter(e => e.type === 'activity').length,
      holiday: events.filter(e => e.type === 'holiday').length
    };
    
    // Calculate events by grade
    const eventsByGrade = grades.map(grade => ({
      grade,
      count: events.filter(e => e.grade === grade).length
    })).filter(item => item.count > 0);
    
    // Calculate upcoming events in the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
    
    // Calculate events distribution by day of the week
    const eventsByDay = [
      { day: 'Dim', fullDay: 'Dimanche', count: 0, color: '#3B82F6' },
      { day: 'Lun', fullDay: 'Lundi', count: 0, color: '#10B981' },
      { day: 'Mar', fullDay: 'Mardi', count: 0, color: '#F59E0B' },
      { day: 'Mer', fullDay: 'Mercredi', count: 0, color: '#EF4444' },
      { day: 'Jeu', fullDay: 'Jeudi', count: 0, color: '#8B5CF6' },
      { day: 'Ven', fullDay: 'Vendredi', count: 0, color: '#EC4899' },
      { day: 'Sam', fullDay: 'Samedi', count: 0, color: '#06B6D4' }
    ];
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dayIndex = eventDate.getDay();
      eventsByDay[dayIndex].count += 1;
    });
    
    // Find the maximum count for scaling the bars
    const maxCount = Math.max(...eventsByDay.map(d => d.count), 1);
    
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#132943] to-blue-700 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-blue-100 text-lg">
                Bienvenue dans votre espace d'administration
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-blue-200">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  {totalEvents} événements au total
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total des événements</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{totalEvents}</p>
                <div className="mt-3 flex items-center text-sm">
                  <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-600 font-medium">Tous types confondus</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#132943] to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cours</p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{eventsByType.class}</p>
                <div className="mt-3 flex items-center text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-gray-600 font-medium">Sessions programmées</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Examens</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{eventsByType.exam}</p>
                <div className="mt-3 flex items-center text-sm">
                  <Clock className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-gray-600 font-medium">Évaluations prévues</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Activités</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{eventsByType.activity}</p>
                <div className="mt-3 flex items-center text-sm">
                  <Star className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-gray-600 font-medium">Événements spéciaux</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Distribution by Type */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Distribution par type</h3>
                <p className="text-gray-600 text-sm mt-1">Répartition des événements</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              {Object.entries(eventsByType).map(([type, count]) => (
                <div key={type} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ 
                        backgroundColor: 
                          type === 'class' ? '#10B981' : 
                          type === 'exam' ? '#EF4444' : 
                          type === 'activity' ? '#3B82F6' : '#F59E0B' 
                      }}></div>
                      <span className="text-sm font-semibold text-gray-700">
                        {type === 'class' ? 'Cours' : 
                         type === 'exam' ? 'Examens' : 
                         type === 'activity' ? 'Activités' : 'Vacances'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${totalEvents > 0 ? (count / totalEvents) * 100 : 0}%`,
                        backgroundColor: 
                          type === 'class' ? '#10B981' : 
                          type === 'exam' ? '#EF4444' : 
                          type === 'activity' ? '#3B82F6' : '#F59E0B' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Events by Day of Week */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Planning hebdomadaire</h3>
                <p className="text-gray-600 text-sm mt-1">Événements par jour</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            <div className="flex items-end justify-between h-48 mt-8">
              {eventsByDay.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className="text-xs font-semibold text-gray-700 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </div>
                  <div 
                    className="w-8 rounded-t-lg transition-all duration-700 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(day.count / maxCount) * 160}px`,
                      backgroundColor: day.color,
                      minHeight: day.count > 0 ? '8px' : '2px'
                    }}
                    title={`${day.fullDay}: ${day.count} événement${day.count !== 1 ? 's' : ''}`}
                  ></div>
                  <div className="text-xs font-semibold text-gray-700 mt-3">{day.day}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Events by Grade and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events by Grade */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Répartition par classe</h3>
                <p className="text-gray-600 text-sm mt-1">Événements par niveau</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {eventsByGrade.length > 0 ? (
                eventsByGrade.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all cursor-pointer group"
                  >
                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[70%] group-hover:text-blue-700 transition-colors">
                      {item.grade}
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                        {item.count}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune donnée à afficher</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Upcoming Events */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Événements à venir</h3>
                <p className="text-gray-600 text-sm mt-1">Cette semaine</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-5 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${
                        event.type === 'class' ? 'bg-blue-100 group-hover:bg-blue-200' : 
                        event.type === 'exam' ? 'bg-red-100 group-hover:bg-red-200' : 
                        event.type === 'activity' ? 'bg-green-100 group-hover:bg-green-200' : 'bg-amber-100 group-hover:bg-amber-200'
                      } transition-colors`}>
                        <div className={
                          event.type === 'class' ? 'text-blue-600' : 
                          event.type === 'exam' ? 'text-red-600' : 
                          event.type === 'activity' ? 'text-green-600' : 'text-amber-600'
                        }>
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                            {event.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ml-2 ${
                            event.type === 'class' ? 'bg-blue-100 text-blue-800' : 
                            event.type === 'exam' ? 'bg-red-100 text-red-800' : 
                            event.type === 'activity' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {event.type === 'class' ? 'Cours' : 
                             event.type === 'exam' ? 'Examen' : 
                             event.type === 'activity' ? 'Activité' : 'Vacances'}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{format(new Date(event.date), 'EEEE d MMM', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                          {event.grade} - Gr.{event.group}
                          {event.section && <span> - {event.section}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun événement à venir</p>
                  <p className="text-xs mt-2">Les prochains événements apparaîtront ici</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-3">
    المواد الدراسية
  </label>
  <div className="space-y-2">
    {[
      { value: 'math', label: 'الرياضيات' },
      { value: 'science', label: 'العلوم' },
      { value: 'arabic', label: 'اللغة العربية' },
      { value: 'french', label: 'اللغة الفرنسية' },
      { value: 'english', label: 'اللغة الإنجليزية' },
      { value: 'history', label: 'التاريخ' },
      { value: 'geography', label: 'الجغرافيا' },
      { value: 'civics', label: 'التربية المدنية' },
      { value: 'islamic', label: 'التربية الإسلامية' },
      { value: 'philosophy', label: 'الفلسفة' },
      { value: 'physics', label: 'الفيزياء' },
      { value: 'chemistry', label: 'الكيمياء' },
      { value: 'biology', label: 'الأحياء' },
      { value: 'computer', label: 'الإعلامية' },
      { value: 'economics', label: 'الاقتصاد' }
    ].map(course => (
      <div key={course.value} className="flex items-center">
        <input
          type="checkbox"
          id={`course-${course.value}`}
          checked={newCredential.courses?.includes(course.value) || false}
          onChange={(e) => {
            const courses = newCredential.courses || [];
            if (e.target.checked) {
              setNewCredential({
                ...newCredential,
                courses: [...courses, course.value]
              });
            } else {
              setNewCredential({
                ...newCredential,
                courses: courses.filter(c => c !== course.value)
              });
            }
          }}
          className="h-4 w-4 text-[#132943] rounded focus:ring-[#132943]"
        />
        <label htmlFor={`course-${course.value}`} className="ml-2 text-sm text-gray-700">
          {course.label}
        </label>
      </div>
    ))}
  </div>
</div>
  const renderStatisticsTab = () => {
    const totalAccesses = accessLogs.length;
    const uniqueClasses = new Set(accessLogs.map(log => `${log.grade} - ${log.group}${log.section ? ` - ${log.section}` : ''}`)).size;
    
    // Calculate average accesses per day/week/month
    let averageAccesses = 0;
    if (statData.length > 0) {
      const total = statData.reduce((sum, item) => sum + item.accesses, 0);
      averageAccesses = Math.round(total / statData.length);
    }
    
    // Colors for pie chart
    const COLORS = ['#132943', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    
    // Calculate access trends over time for line chart
    const trendData = [...statData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate hourly access pattern
    const hourlyAccess: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyAccess[i] = 0;
    }
    
    accessLogs.forEach(log => {
      const hour = new Date(log.accessed_at).getHours();
      hourlyAccess[hour] = (hourlyAccess[hour] || 0) + 1;
    });
    
    const hourlyData = Object.keys(hourlyAccess).map(hour => ({
      hour: `${hour}:00`,
      accesses: hourlyAccess[parseInt(hour)]
    }));
    
    return (
      <div className="space-y-8">
        {/* Statistics Header */}
        <div className="bg-gradient-to-r from-[#132943] to-blue-700 rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Statistiques d'accès</h2>
              <p className="text-blue-100 text-lg">Analyse détaillée de l'utilisation du calendrier</p>
            </div>
            <button
              onClick={fetchAccessLogs}
              disabled={isLoadingStats}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all disabled:opacity-50 border border-white/20"
            >
              {isLoadingStats ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>Actualiser</span>
            </button>
            <button
  onClick={exportClassCredentials}
  className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/20"
>
  <Download className="w-5 h-5" />
  <span>Exporter</span>
</button>  
          </div>
        </div>

        {/* Statistics Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Filtres et paramètres</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Plage de dates</label>
              <select
                value={statDateRange}
                onChange={(e) => setStatDateRange(e.target.value as DateRange)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
            
            {statDateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Du</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Au</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Affichage</label>
              <select
                value={statView}
                onChange={(e) => setStatView(e.target.value as StatView)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="daily">Journalier</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Classe</label>
              <select
                value={statGrade}
                onChange={(e) => setStatGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="">Toutes les classes</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total des accès</p>
                <p className="text-4xl font-bold text-[#132943] mt-2">{totalAccesses}</p>
                <div className="mt-3 flex items-center text-sm">
                  <Activity className="w-4 h-4 text-[#132943] mr-1" />
                  <span className="text-gray-600 font-medium">Connexions totales</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#132943] to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Classes actives</p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{uniqueClasses}</p>
                <div className="mt-3 flex items-center text-sm">
                  <UsersIcon className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-gray-600 font-medium">Classes représentées</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Moyenne</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{averageAccesses}</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {statView === 'daily' ? 'par jour' : 
                   statView === 'weekly' ? 'par semaine' : 'par mois'}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BarChart2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Access Over Time Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Évolution des accès</h3>
                <p className="text-gray-600 text-sm mt-1">Tendance dans le temps</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-[#132943] animate-spin mb-4" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : statData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="accessGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#132943" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#132943" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accesses" 
                    name="Accès" 
                    stroke="#132943" 
                    strokeWidth={3}
                    fill="url(#accessGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-xs mt-2">Sélectionnez une période différente</p>
              </div>
            )}
          </div>
          
          {/* Grade Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Répartition par classe</h3>
                <p className="text-gray-600 text-sm mt-1">Distribution des accès</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-[#132943] animate-spin mb-4" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      `${value} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-xs mt-2">Aucun accès dans cette période</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hourly Access Pattern */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Activité horaire</h3>
                <p className="text-gray-600 text-sm mt-1">Accès par heure de la journée</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-[#132943] animate-spin mb-4" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Bar 
                    dataKey="accesses" 
                    name="Accès" 
                    fill="#132943" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Access Trend Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tendance linéaire</h3>
                <p className="text-gray-600 text-sm mt-1">Évolution détaillée</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-[#132943] animate-spin mb-4" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : statData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accesses" 
                    name="Accès" 
                    stroke="#132943" 
                    strokeWidth={3}
                    dot={{ fill: '#132943', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#132943', strokeWidth: 2, fill: 'white' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-xs mt-2">Aucun accès dans cette période</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Access Logs Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Journaux d'accès récents</h3>
              <p className="text-gray-600 text-sm mt-1">20 dernières connexions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          
          {isLoadingStats ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <Loader className="w-8 h-8 text-[#132943] animate-spin mb-4" />
                <p className="text-gray-500">Chargement des journaux...</p>
              </div>
            </div>
          ) : accessLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Date et heure
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Groupe
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Section
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accessLogs.slice(0, 20).map((log, index) => (
                    <motion.tr 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(log.accessed_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Groupe {log.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.section ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {log.section}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {accessLogs.length > 20 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                    Affichage des 20 premiers journaux sur <span className="font-semibold">{accessLogs.length}</span> au total
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun journal d'accès</p>
              <p className="text-xs mt-2">Les connexions apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderSettings = () => (
    <div className="space-y-8">
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-[#132943] to-blue-700 rounded-3xl p-8 text-white">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Paramètres</h2>
            <p className="text-blue-100 text-lg">Configuration et gestion du système</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-[#132943] rounded-xl flex items-center justify-center mr-4">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gestion du compte administrateur</h3>
            <p className="text-gray-600 text-sm mt-1">Modifier les identifiants de connexion</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              name="username"
              value={settingsForm.username}
              onChange={handleSettingsChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              placeholder="Nouveau nom d'utilisateur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mot de passe actuel
            </label>
            <input
              type="password"
              name="currentPassword"
              value={settingsForm.currentPassword}
              onChange={handleSettingsChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              placeholder="Mot de passe actuel"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              name="newPassword"
              value={settingsForm.newPassword}
              onChange={handleSettingsChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              placeholder="Nouveau mot de passe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={settingsForm.confirmPassword}
              onChange={handleSettingsChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>
        </div>
        
        {settingsError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200"
          >
            {settingsError}
          </motion.div>
        )}
        
        <div className="mt-8">
          <button
            onClick={handleSettingsSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#132943] to-blue-700 text-white py-4 px-8 rounded-xl font-semibold hover:from-[#1a3152] hover:to-blue-800 focus:ring-4 focus:ring-[#132943]/20 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Mise à jour en cours...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Mettre à jour le compte
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gestion des données</h3>
            <p className="text-gray-600 text-sm mt-1">Importer et exporter les événements</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6 hover:border-[#132943]/30 transition-colors"> 
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Exporter les données</p>
                <p className="text-sm text-gray-600">Télécharger en format CSV</p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>{isExporting ? 'Export en cours...' : 'Exporter les événements'}</span>
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-6 hover:border-[#132943]/30 transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Importer des données</p>
                <p className="text-sm text-gray-600">Charger depuis un fichier CSV</p>
              </div>
            </div>
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50">
              {isImporting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>{isImporting ? 'Import en cours...' : 'Importer des événements'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportData}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPupilsTab = () => (
    <div className="space-y-8">
      {/* Pupils Header */}
      <div className="bg-gradient-to-r from-[#132943] to-blue-700 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Gestion des élèves</h2>
              <p className="text-blue-100 text-lg">Configuration des accès par classe</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setEditingCredential(null)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/20"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter</span>
            </button>
            <button
              onClick={refreshClassCredentials}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/20"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Actualiser</span>
            </button>
            <button
  onClick={() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les identifiants de classe? Cette action ne peut pas être annulée.')) {
      const newCredentials = generateClassCredentials();
      setClassCredentials(newCredentials);
      localStorage.setItem('classCredentials', JSON.stringify(newCredentials));
      setNotification({ type: 'success', message: 'Les identifiants de classe ont été réinitialisés avec succès' });
    }
  }}
  className="flex items-center space-x-2 px-6 py-3 bg-red-600/20 backdrop-blur-sm text-red-600 rounded-xl hover:bg-red-600/30 transition-all border border-red-600/20"
>
  <RefreshCw className="w-5 h-5" />
  <span>Réinitialiser tout</span>
</button>
          </div>
        </div>
      </div>
      
      {/* Search Bar for Pupils */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={pupilSearchTerm}
            onChange={(e) => setPupilSearchTerm(e.target.value)}
            placeholder="Rechercher une classe, un groupe, une section ou un mot de passe..."
            className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all text-sm bg-gray-50"
          />
          {pupilSearchTerm && (
            <button
              onClick={() => setPupilSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-[#132943]">{filteredPupils.length}</span> résultat{filteredPupils.length !== 1 ? 's' : ''} trouvé{filteredPupils.length !== 1 ? 's' : ''} sur {classCredentials.length} classes
          </span>
          <div className="flex items-center space-x-2 text-gray-500">
            <Users className="w-4 h-4" />
            <span>{classCredentials.length} classes totales</span>
          </div>
        </div>
      </div>
      
      {/* Add New Credential Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ajouter une nouvelle classe</h3>
            <p className="text-gray-600 text-sm mt-1">Créer un nouveau groupe d'élèves</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Classe
            </label>
            <select
              value={newCredential.grade}
              onChange={(e) => setNewCredential({...newCredential, grade: e.target.value})}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
            >
              <option value="">Sélectionner la classe</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Groupe
            </label>
            <select
              value={newCredential.group}
              onChange={(e) => setNewCredential({...newCredential, group: e.target.value})}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
            >
              <option value="">Sélectionner le groupe</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          {(newCredential.grade === '2ème année lycée' || newCredential.grade === '3ème année lycée' || newCredential.grade === 'Baccalauréat') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Section
              </label>
              <select
                value={newCredential.section || ''}
                onChange={(e) => setNewCredential({...newCredential, section: e.target.value})}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="">Sélectionner la section</option>
                {newCredential.grade === '2ème année lycée' ? (
                  secondYearSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))
                ) : newCredential.grade === '3ème année lycée' ? (
                  thirdYearSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))
                ) : (
                  bacSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))
                )}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mot de passe
            </label>
            <input
              type="text"
              value={newCredential.password}
              onChange={(e) => setNewCredential({...newCredential, password: e.target.value})}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm font-mono"
              placeholder="Mot de passe d'accès"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleAddCredential}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter la classe</span>
          </button>
        </div>
      </div>
      
      {/* Credentials List with Dropdowns */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Classes et mots de passe</h3>
            <p className="text-gray-600 text-sm mt-1">Gestion des accès par classe</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={expandAllGrades}
              className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tout développer
            </button>
            <button
              onClick={collapseAllGrades}
              className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tout réduire
            </button>
          </div>
        </div>
        
        {filteredPupils.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-600 font-semibold">Aucune classe trouvée</p>
            <p className="text-sm text-gray-500 mt-2">Modifiez vos critères de recherche ou ajoutez une nouvelle classe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grades.map(grade => {
              const gradeCredentials = filteredPupils.filter(cred => cred.grade === grade);
              if (gradeCredentials.length === 0) return null;
              
              const isExpanded = expandedGrades[grade] || false;
              const hasSections = grade.includes('2ème année lycée') || grade.includes('3ème année lycée') || grade.includes('Baccalauréat');
              
              return (
                <motion.div 
                  key={grade} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#132943]/30 transition-colors"
                >
                  <button
                    onClick={() => toggleGradeExpansion(grade)}
                    className="w-full flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#132943]/5 hover:to-blue-50 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="mr-4 p-2 rounded-lg bg-white shadow-sm">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-[#132943]" /> : <ChevronDown className="w-5 h-5 text-[#132943]" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-gray-900 text-lg">{grade}</span>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {gradeCredentials.length} {gradeCredentials.length === 1 ? 'classe' : 'classes'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCredential(classCredentials.findIndex(c => c.grade === grade));
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-white"
                    >
                      {hasSections ? (
                        // Group by sections for grades that have sections
                        (() => {
                          const sections = Array.from(new Set(gradeCredentials.map(cred => cred.section).filter(Boolean)));
                          
                          return sections.map(section => {
                            const sectionCredentials = gradeCredentials.filter(cred => cred.section === section);
                            
                            return (
                              <div key={section} className="mb-6 last:mb-0">
                                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                                    {section}
                                  </span>
                                  <span className="text-sm text-gray-500">{sectionCredentials.length} groupe{sectionCredentials.length !== 1 ? 's' : ''}</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {sectionCredentials.map((credential, index) => {
                                    const originalIndex = classCredentials.findIndex(c => 
                                      c.grade === credential.grade && 
                                      c.group === credential.group && 
                                      c.section === credential.section
                                    );
                                    
                                    return (
                                      <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-[#132943]/30"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-bold text-gray-900 mb-2">Groupe {credential.group}</div>
                                            <div className="text-sm text-gray-600 mb-3">
                                              <span className="font-mono bg-gray-100 px-3 py-2 rounded-lg inline-block">
                                                {credential.password}
                                              </span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                              <Shield className="w-3 h-3 mr-1" />
                                              <span>Mot de passe d'accès</span>
                                            </div>
                                          </div>
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => handleEditCredential(originalIndex)}
                                              className="p-2 rounded-lg hover:bg-blue-100 transition-colors text-blue-600"
                                              title="Modifier"
                                            >
                                              <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteCredential(originalIndex)}
                                              className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                                              title="Supprimer"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()
                      ) : (
                        // Simple grid for grades without sections
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {gradeCredentials.map((credential, index) => {
                            const originalIndex = classCredentials.findIndex(c => 
                              c.grade === credential.grade && 
                              c.group === credential.group
                            );
                            
                            return (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-[#132943]/30"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold text-gray-900 mb-2">Groupe {credential.group}</div>
                                    <div className="text-sm text-gray-600 mb-3">
                                      <span className="font-mono bg-gray-100 px-3 py-2 rounded-lg inline-block">
                                        {credential.password}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Shield className="w-3 h-3 mr-1" />
                                      <span>Mot de passe d'accès</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEditCredential(originalIndex)}
                                      className="p-2 rounded-lg hover:bg-blue-100 transition-colors text-blue-600"
                                      title="Modifier"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCredential(originalIndex)}
                                      className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Edit Credential Modal */}
      {editingCredential && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ltr"
          onClick={() => setEditingCredential(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Modifier le mot de passe
                </h2>
                <button 
                  onClick={() => setEditingCredential(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Classe
                  </label>
                  <input
                    type="text"
                    value={editingCredential.grade}
                    onChange={(e) => setEditingCredential({...editingCredential, grade: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-gray-50 text-sm"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Groupe
                  </label>
                  <input
                    type="text"
                    value={editingCredential.group}
                    onChange={(e) => setEditingCredential({...editingCredential, group: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-gray-50 text-sm"
                    disabled
                  />
                </div>
                
                {editingCredential.section && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Section
                    </label>
                    <input
                      type="text"
                      value={editingCredential.section}
                      onChange={(e) => setEditingCredential({...editingCredential, section: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-gray-50 text-sm"
                      disabled
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="text"
                    value={editingCredential.password}
                    onChange={(e) => setEditingCredential({...editingCredential, password: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm font-mono"
                    placeholder="Entrez le nouveau mot de passe"
                  />
                  <p className="text-xs text-gray-500 mt-2">Ce mot de passe sera utilisé par les élèves pour accéder au calendrier</p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleUpdateCredential}
                    className="flex-1 bg-gradient-to-r from-[#132943] to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a3152] hover:to-blue-800 focus:ring-4 focus:ring-[#132943]/20 transition-all duration-300 shadow-lg"
                  >
                    Enregistrer les modifications
                  </button>
                  
                  <button
                    onClick={() => setEditingCredential(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
  
  const renderEventCard = (event: CalendarEvent) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl mr-4 ${
              event.type === 'class' ? 'bg-blue-100 group-hover:bg-blue-200' : 
              event.type === 'exam' ? 'bg-red-100 group-hover:bg-red-200' : 
              event.type === 'activity' ? 'bg-green-100 group-hover:bg-green-200' : 'bg-amber-100 group-hover:bg-amber-200'
            } transition-colors`}>
              <div className={
                event.type === 'class' ? 'text-blue-600' : 
                event.type === 'exam' ? 'text-red-600' : 
                event.type === 'activity' ? 'text-green-600' : 'text-amber-600'
              }>
                {getEventIcon(event.type)}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">{event.title}</h3>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-semibold ${
                  event.type === 'class' ? 'text-blue-600' : 
                  event.type === 'exam' ? 'text-red-600' : 
                  event.type === 'activity' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {event.type === 'class' ? 'Cours' : 
                   event.type === 'exam' ? 'Examen' : 
                   event.type === 'activity' ? 'Activité' : 'Vacances'}
                </span>
              </div>
            </div>
          </div>
<div className="flex space-x-2">
  <button
    onClick={() => handleEdit(event)}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    title="Modifier"
  >
    <Edit className="w-4 h-4 text-gray-600" />
  </button>
  <button
    onClick={() => handleDuplicateEvent(event)}
    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
    title="Dupliquer"
  >
    <Copy className="w-4 h-4 text-blue-600" />
  </button>
  <button
    onClick={() => handleDelete(event.id)}
    disabled={isDeleting}
    className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    title="Supprimer"
  >
    {isDeleting && eventToDelete === event.id ? (
      <Loader className="w-4 h-4 animate-spin text-red-600" />
    ) : (
      <Trash2 className="w-4 h-4 text-red-600" />
    )}
  </button>
</div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
            Classe: {event.grade}
          </span>
          <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
            Groupe: {event.group}
          </span>
          {event.section && (
            <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
              Section: {event.section}
            </span>
          )}
        </div>
        
        {event.description && (
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {event.description}
          </div>
        )}
      </div>
    </motion.div>
  );
  
  const renderEventsTab = () => (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Événements</h2>
          <div className="text-sm text-gray-600 mt-2">
            {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''}
            {(selectedGrade || selectedGroup || selectedSection || dateRange !== 'all' || searchTerm) && (
              <span className="mx-2">•</span>
            )}
            {selectedGrade && <span>Classe: {selectedGrade}</span>}
            {selectedGroup && <span> - Groupe: {selectedGroup}</span>}
            {selectedSection && <span> - Section: {selectedSection}</span>}
            {dateRange !== 'all' && (
              <span> - {dateRange === 'today' ? 'Aujourd\'hui' : dateRange === 'week' ? 'Cette semaine' : 'Ce mois'}</span>
            )}
            {searchTerm && <span> - Recherche: {searchTerm}</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#132943] to-blue-700 text-white rounded-xl hover:from-[#1a3152] hover:to-blue-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un événement</span>
          </button>
          
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filtrer</span>
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Vue grille"
            >
              <Grid className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Vue liste"
            >
              <List className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {showBulkActions && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span>Supprimer la sélection ({selectedEvents.length})</span>
            </button>
          )}
          
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
            <span>Sélection multiple</span>
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {isFiltersOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Filtres et recherche</h3>
            <button 
              onClick={() => setIsFiltersOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Plage de dates
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="all">Tous les événements</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Classe
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="">Toutes les classes</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Groupe
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              >
                <option value="">Tous les groupes</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            {(selectedGrade === '2ème année lycée' || selectedGrade === '3ème année lycée' || selectedGrade === 'Baccalauréat') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                >
                  <option value="">Toutes les sections</option>
                  {selectedGrade === '2ème année lycée' ? (
                    secondYearSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))
                  ) : selectedGrade === '3ème année lycée' ? (
                    thirdYearSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))
                  ) : (
                    bacSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Recherche
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un événement..."
                className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setSelectedGrade('');
                setSelectedGroup('');
                setSelectedSection('');
                setSearchTerm('');
                setDateRange('all');
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Effacer les filtres</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Event Form Modal */}
      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ltr"
          onClick={() => setIsFormOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Modifier un événement' : 'Ajouter un nouvel événement'}
                </h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Sections */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    type="button"
                    onClick={() => setFormSection('basic')}
                    className={`px-6 py-3 font-semibold text-sm flex items-center ${
                      formSection === 'basic'
                        ? 'text-[#132943] border-b-2 border-[#132943]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Informations de base
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSection('details')}
                    className={`px-6 py-3 font-semibold text-sm flex items-center ${
                      formSection === 'details'
                        ? 'text-[#132943] border-b-2 border-[#132943]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Détails
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSection('classification')}
                    className={`px-6 py-3 font-semibold text-sm flex items-center ${
                      formSection === 'classification'
                        ? 'text-[#132943] border-b-2 border-[#132943]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Classification
                  </button>
                </div>
                
                {formSection === 'basic' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Titre de l'événement
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                        placeholder="Titre de l'événement"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={eventForm.date}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Type
                        </label>
                        <select
                          name="type"
                          value={eventForm.type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        >
                          <option value="class">Cours</option>
                          <option value="exam">Examen</option>
                          <option value="activity">Activité</option>
                          <option value="holiday">Vacances</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Heure de début
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={eventForm.startTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={eventForm.endTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {formSection === 'details' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Lieu
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                        placeholder="Lieu de l'événement"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={eventForm.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm resize-none"
                        placeholder="Description de l'événement"
                      />
                    </div>
                  </>
                )}
                
                {formSection === 'classification' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Classe
                        </label>
                        <select
                          name="grade"
                          value={eventForm.grade}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        >
                          <option value="">Sélectionner la classe</option>
                          {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Groupe
                        </label>
                        <select
                          name="group"
                          value={eventForm.group}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        >
                          <option value="">Sélectionner le groupe</option>
                          {groups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {(eventForm.grade === '2ème année lycée' || eventForm.grade === '3ème année lycée' || eventForm.grade === 'Baccalauréat') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Section
                        </label>
                        <select
                          name="section"
                          value={eventForm.section}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#132943]/10 focus:border-[#132943] transition-all bg-white text-sm"
                          required
                        >
                          <option value="">Sélectionner la section</option>
                          {eventForm.grade === '2ème année lycée' ? (
                            secondYearSections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))
                          ) : eventForm.grade === '3ème année lycée' ? (
                            thirdYearSections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))
                          ) : (
                            bacSections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-6 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#132943] to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a3152] hover:to-blue-800 focus:ring-4 focus:ring-[#132943]/20 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Enregistrement en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {isEditing ? 'Mettre à jour l\'événement' : 'Ajouter l\'événement'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-600 font-semibold">Aucun événement</p>
          <p className="text-sm text-gray-500 mt-2">Ajoutez un nouvel événement ou modifiez vos filtres</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-6 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#132943] to-blue-700 text-white rounded-xl hover:from-[#1a3152] hover:to-blue-800 transition-all shadow-lg mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un nouvel événement</span>
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {showBulkActions && (
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedEvents.length === filteredEvents.length}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 text-[#132943] rounded focus:ring-[#132943]"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Événement
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleEvents.map((event) => (
                      <motion.tr 
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {showBulkActions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.id)}
                              onChange={() => toggleEventSelection(event.id)}
                              className="h-4 w-4 text-[#132943] rounded focus:ring-[#132943]"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          {event.location && (
                            <div className="text-sm text-gray-500">{event.location}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(event.date), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.startTime} - {event.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{event.grade}</div>
                          <div>Groupe {event.group}{event.section && ` - ${event.section}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.type === 'class' ? 'bg-blue-100 text-blue-800' : 
                            event.type === 'exam' ? 'bg-red-100 text-red-800' : 
                            event.type === 'activity' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {event.type === 'class' ? 'Cours' : 
                             event.type === 'exam' ? 'Examen' : 
                             event.type === 'activity' ? 'Activité' : 'Vacances'}
                          </span>
                        </td>
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex space-x-2">
    <button
      onClick={() => handleEdit(event)}
      className="text-blue-600 hover:text-blue-900"
      title="Modifier"
    >
      <Edit className="w-4 h-4" />
    </button>
    <button
      onClick={() => handleDuplicateEvent(event)}
      className="text-blue-600 hover:text-blue-900"
      title="Dupliquer"
    >
      <Copy className="w-4 h-4" />
    </button>
    <button
      onClick={() => handleDelete(event.id)}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
      title="Supprimer"
    >
      {isDeleting && eventToDelete === event.id ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  </div>
</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Load More Button */}
          {visibleEvents.length < filteredEvents.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreEvents}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#132943] to-blue-700 text-white rounded-xl hover:from-[#1a3152] hover:to-blue-800 transition-all shadow-lg"
              >
                <ChevronDown className="w-5 h-5" />
                <span>Charger plus d'événements</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  const renderAdminPanel = () => (
    <div className="min-h-screen bg-gray-50 ltr admin-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#132943] to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord MBSchool</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? 'Déconnexion en cours...' : 'Se déconnecter'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8 pt-0">
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-4 font-semibold text-sm flex items-center ${
              activeTab === 'events'
                ? 'text-[#132943] border-b-2 border-[#132943]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Événements
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-4 font-semibold text-sm flex items-center ${
              activeTab === 'dashboard'
                ? 'text-[#132943] border-b-2 border-[#132943]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('pupils')}
            className={`px-6 py-4 font-semibold text-sm flex items-center ${
              activeTab === 'pupils'
                ? 'text-[#132943] border-b-2 border-[#132943]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Élèves
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-4 font-semibold text-sm flex items-center ${
              activeTab === 'statistics'
                ? 'text-[#132943] border-b-2 border-[#132943]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 font-semibold text-sm flex items-center ${
              activeTab === 'settings'
                ? 'text-[#132943] border-b-2 border-[#132943]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Paramètres
          </button>
        </div>
        
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'pupils' && renderPupilsTab()}
        {activeTab === 'statistics' && renderStatisticsTab()}
        {activeTab === 'settings' && renderSettings()}
      </main>
      
      {renderNotification()}
    </div>
  );
  
  return (
    <>
      {isLoggedIn ? renderAdminPanel() : renderLogin()}
    </>
  );
};

export default AdminPage; 