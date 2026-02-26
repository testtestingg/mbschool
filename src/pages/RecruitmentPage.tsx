import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string;
  motivation: string;
  cv: File | null;
}

const RecruitmentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    motivation: '',
    cv: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        cv: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const positionLabel = formData.position === 'data-science' 
        ? 'Formateur en Data Science & Machine Learning' 
        : 'Formateur en Intelligence Artificielle (AI)';

      // Create form data for Getform
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('position', positionLabel);
      formPayload.append('experience', formData.experience);
      formPayload.append('skills', formData.skills);
      formPayload.append('motivation', formData.motivation);
      if (formData.cv) {
        formPayload.append('cv', formData.cv);
      }

      // Send to Getform
      const response = await fetch('https://getform.io/f/agdjzjyb', {
        method: 'POST',
        body: formPayload
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after success
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          skills: '',
          motivation: '',
          cv: null
        });
      } else {
        throw new Error('Failed to send application');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      setErrorMessage('Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50" dir="ltr">
      <style>{`
        /* Override the global padding for this page */
        main {
          padding-top: 0 !important;
        }
        
        /* Improved responsiveness */
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .job-cards {
            grid-template-columns: 1fr;
          }
          
          .form-container {
            padding: 1.5rem;
          }
          
          .submit-button {
            width: 100%;
            padding: 1rem;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .job-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Header - Fixed at top without extra padding */}
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
                  MBSchool - Recrutement
                </h1>
                <p className="text-gray-500 text-sm">Rejoignez notre équipe de formateurs</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-medium shadow-lg transform hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Rejoignez notre équipe de formateurs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous recherchons des formateurs passionnés pour partager leur expertise en Data Science, Machine Learning et Intelligence Artificielle.
            </p>
          </motion.div>

          {/* Job Offers */}
          <div className="grid md:grid-cols-2 gap-6 mb-10 job-cards">
            {/* Data Science & ML Position */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Formateur en Data Science & Machine Learning</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Profil recherché :</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Solide expérience en Data Science et Machine Learning</li>
                    <li>Maîtrise de Python, Pandas, NumPy, Scikit-learn, TensorFlow/PyTorch</li>
                    <li>Bonnes connaissances en statistiques, modélisation et traitement de données</li>
                    <li>Capacité à vulgariser et à créer un contenu pédagogique clair</li>
                    <li>Expérience en formation ou encadrement est un plus</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Missions :</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Concevoir et animer des formations pratiques en Data Science & Machine Learning</li>
                    <li>Encadrer les apprenants dans leurs projets et études de cas</li>
                    <li>Mettre à jour et enrichir les supports pédagogiques</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* AI Position */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Formateur en Intelligence Artificielle (AI)</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Profil recherché :</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Expertise en IA appliquée : NLP, Computer Vision, Chatbots, systèmes intelligents...</li>
                    <li>Maîtrise des frameworks : TensorFlow, PyTorch, Keras, Transformers, OpenCV, etc.</li>
                    <li>Connaissances en Deep Learning et en architectures de réseaux neuronaux</li>
                    <li>Aptitude à rendre accessible des concepts avancés</li>
                    <li>Expérience pédagogique ou encadrement souhaitée</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Missions :</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Concevoir et animer des modules de formation en Intelligence Artificielle</li>
                    <li>Encadrer des projets concrets (ex : reconnaissance d'images, traitement du langage naturel, etc.)</li>
                    <li>Réaliser une veille technologique et adapter le contenu de formation</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Application Form */}
          <motion.div 
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Postuler</h3>
            
            {submitStatus === 'success' && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700">Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt.</p>
              </motion.div>
            )}
            
            {submitStatus === 'error' && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{errorMessage}</p>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 form-grid">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-left"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-left"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 form-grid">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-left"
                    required
                  />
                </div>
                
                {/* Position */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Poste souhaité
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-left"
                    required
                  >
                    <option value="">Sélectionner un poste</option>
                    <option value="data-science">Formateur en Data Science & Machine Learning</option>
                    <option value="ai">Formateur en Intelligence Artificielle (AI)</option>
                  </select>
                </div>
              </div>
              
              {/* Experience */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Expérience professionnelle
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none text-left"
                  placeholder="Décrivez votre expérience pertinente..."
                  required
                ></textarea>
              </div>
              
              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Compétences techniques
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none text-left"
                  placeholder="Listez vos compétences techniques pertinentes..."
                  required
                ></textarea>
              </div>
              
              {/* Motivation */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Lettre de motivation
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none text-left"
                  placeholder="Pourquoi souhaitez-vous rejoindre notre équipe ?"
                  required
                ></textarea>
              </div>
              
              {/* CV Upload - Getform supports file uploads! */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-left"
                  required
                />
                {formData.cv && (
                  <p className="mt-2 text-sm text-gray-600 text-left">Fichier sélectionné: {formData.cv.name}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-cyan-500/20 transition-all disabled:opacity-50 transform hover:scale-105 submit-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer ma candidature</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RecruitmentPage; 