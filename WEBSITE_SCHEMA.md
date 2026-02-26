# MBSchool Website Structure & Schema

## 📁 Project Overview
MBSchool is a comprehensive educational platform built with React, TypeScript, and Vite, featuring multiple educational modules and user interfaces.

## 🏗️ Architecture Overview

```
MBSchool Website
├── Frontend (React + TypeScript + Vite)
├── Database (Supabase)
├── Deployment (Netlify)
└── External Services (Formspree, Google Analytics)
```

## 📂 File Structure

```
/
├── public/
│   ├── robots.txt                 # SEO crawling rules
│   └── sitemap.xml               # Site structure for search engines
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Basic UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── textarea.tsx
│   │   ├── ChatGPT.tsx          # AI assistant component
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Header.tsx           # Navigation header
│   │   ├── MathParallax.tsx     # Background animations
│   │   ├── PaperBackground.tsx  # Background styling
│   │   ├── Preloader.tsx        # Loading screen
│   │   └── ThemeToggle.jsx      # Dark/light mode toggle
│   │
│   ├── data/                    # Educational content
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── index.ts             # Data aggregation
│   │   ├── math.ts              # Mathematics questions
│   │   ├── science.ts           # Science questions
│   │   ├── biology.ts           # Biology questions
│   │   ├── chemistry.ts         # Chemistry questions
│   │   ├── physics.ts           # Physics questions
│   │   ├── history.ts           # History questions
│   │   ├── geography.ts         # Geography questions
│   │   └── questions.ts         # Additional questions
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useScrollRestoration.tsx
│   │
│   ├── pages/                   # Main application pages
│   │   ├── About.tsx            # About page with achievements
│   │   ├── AdminPage.tsx        # Admin dashboard
│   │   ├── CalendarPage.tsx     # Student schedule viewer
│   │   ├── Contact.tsx          # Contact form
│   │   ├── Home.tsx             # Landing page
│   │   ├── NotFound.tsx         # 404 error page
│   │   ├── Registration.tsx     # Student registration
│   │   ├── RegistrationPage.tsx # Alternative registration
│   │   ├── Services.tsx         # Services overview
│   │   ├── TeacherPage.tsx      # Teacher dashboard
│   │   └── learning-challenge.tsx # Interactive learning game
│   │
│   ├── lib/
│   │   └── supabase.ts          # Database configuration
│   │
│   ├── utils/
│   │   └── supabaseClient.ts    # Supabase client setup
│   │
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts           # Vite type definitions
│
├── supabase/
│   └── migrations/              # Database schema migrations
│       └── 20250802145309_floating_dew.sql
│
├── Configuration Files
├── index.html                   # Main HTML template
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TypeScript config
├── tsconfig.node.json          # Node-specific TypeScript config
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
├── vercel.json                 # Deployment configuration
├── .env                        # Environment variables
└── README.md                   # Project documentation
```

## 🎯 Core Features & Modules

### 1. **Educational System**
- **Learning Challenge** (`learning-challenge.tsx`)
  - Interactive quiz system
  - Multiple subjects (Math, Science, Biology, etc.)
  - Difficulty levels (Easy, Medium, Hard)
  - Grade levels (Primary, Middle, Secondary, Baccalaureate)
  - Real-time scoring and feedback

### 2. **User Management**
- **Student Registration** (`Registration.tsx`)
  - Multi-step form with validation
  - Subject selection
  - Academic information collection
  - CAPTCHA verification

- **Teacher Dashboard** (`TeacherPage.tsx`)
  - Code generation for student access
  - Student progress monitoring
  - Leaderboard management

- **Admin Panel** (`AdminPage.tsx`)
  - System administration
  - User management

### 3. **Calendar System** (`CalendarPage.tsx`)
- Class schedule viewing
- Event management
- Grade-specific access control
- Mobile-responsive calendar interface

### 4. **Content Management**
- **Question Database** (`src/data/`)
  - 8 subjects with comprehensive question sets
  - Structured by difficulty and grade level
  - Arabic language support
  - Detailed explanations

## 🗄️ Database Schema (Supabase)

### Tables Structure:

#### 1. **profiles**
```sql
- id (uuid, PK, references auth.users)
- username (text, unique)
- created_at (timestamp)
```

#### 2. **attempts**
```sql
- id (bigserial, PK)
- user_id (uuid, references auth.users)
- grade (text)
- difficulty (text)
- score (int)
- accuracy (int)
- best_streak (int)
- total_questions (int)
- created_at (timestamp)
```

#### 3. **teachers** (inferred from TeacherPage.tsx)
```sql
- id (uuid, PK)
- name (text)
- password (text)
- created_at (timestamp)
```

#### 4. **verification_codes** (inferred from TeacherPage.tsx)
```sql
- id (uuid, PK)
- code (text)
- teacher_id (uuid, references teachers)
- expires_at (timestamp)
- created_at (timestamp)
- max_attempts (int)
- is_active (boolean)
- subject (text)
- difficulty (text)
- grade (text)
```

#### 5. **game_sessions** (inferred from TeacherPage.tsx)
```sql
- id (uuid, PK)
- student_name (text)
- score (int)
- accuracy (int)
- best_streak (int)
- grade (text)
- difficulty (text)
- created_at (timestamp)
```

#### 6. **schedules** (inferred from CalendarPage.tsx)
```sql
- id (uuid, PK)
- title (text)
- date (date)
- startTime (text)
- endTime (text)
- location (text)
- description (text)
- type (text) # 'class', 'exam', 'activity', 'holiday'
- grade (text)
- group (text)
- section (text)
```

## 🎨 Design System

### Color Palette:
```css
Primary: #0E2138 (Dark Blue)
Secondary: #03CCED (Cyan)
Accent: #EFB533 (Gold)
Muted: #3D506D (Gray Blue)
Background: #ffffff (White)
```

### Typography:
- **Font Family**: 'Tajawal' (Arabic support)
- **Weights**: 400, 500, 700
- **Direction**: RTL (Right-to-Left) for Arabic content

## 🛣️ Routing Structure

```
/ (Home)                    # Landing page
├── /about                  # About page with achievements
├── /services              # Services overview
├── /contact               # Contact form
├── /register              # Student registration
├── /learning-challenge    # Interactive learning game
├── /calendar              # Student schedule viewer
├── /teacher               # Teacher dashboard
├── /admin                 # Admin panel
└── /* (NotFound)          # 404 error page
```

## 🔐 Authentication & Access Control

### Access Levels:
1. **Public**: Home, About, Services, Contact
2. **Student**: Learning Challenge, Calendar (with class credentials)
3. **Teacher**: Teacher Dashboard (with teacher credentials)
4. **Admin**: Admin Panel (with admin credentials)

### Security Features:
- Row Level Security (RLS) on all database tables
- CAPTCHA verification on forms
- Spam detection and prevention
- Input validation and sanitization

## 📱 Responsive Design

### Breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features:
- Touch-optimized interfaces
- Responsive navigation
- Mobile-specific layouts
- Optimized performance

## 🔧 Technical Stack

### Frontend:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend Services:
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: Formspree
- **Analytics**: Google Analytics

### Development Tools:
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **CSS Processing**: PostCSS + Autoprefixer

## 🌐 External Integrations

### APIs & Services:
1. **Supabase**: Database and authentication
2. **Formspree**: Form submissions
3. **Google Analytics**: Website analytics
4. **OpenAI**: AI assistant (ChatGPT component)
5. **Google reCAPTCHA**: Spam protection

### CDNs & Assets:
- **Images**: ImgBB hosting
- **Fonts**: Google Fonts (Tajawal)
- **Icons**: Lucide React library

## 📊 Data Flow

### Learning Challenge Flow:
```
Student → Teacher Code → Subject/Difficulty Selection → Questions → Results → Leaderboard
```

### Registration Flow:
```
Student → Level Selection → Course Selection → Contact Info → Academic Info → Confirmation → Submission
```

### Calendar Flow:
```
Student → Class Login → Schedule View → Event Details
```

## 🚀 Deployment

### Build Process:
1. TypeScript compilation
2. Vite bundling
3. Tailwind CSS processing
4. Asset optimization
5. Netlify deployment

### Environment Variables:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_OPENAI_API_KEY`: OpenAI API key (for ChatGPT)

## 📈 Performance Optimizations

### Frontend:
- Code splitting with React.lazy()
- Image optimization
- CSS purging with Tailwind
- Bundle size optimization

### Backend:
- Database indexing
- Query optimization
- Row Level Security for data protection

## 🔍 SEO & Analytics

### SEO Features:
- Meta tags optimization
- Sitemap.xml
- Robots.txt
- Open Graph tags
- Google site verification

### Analytics:
- Google Analytics 4 integration
- User behavior tracking
- Performance monitoring

## 🛡️ Security Measures

### Frontend Security:
- Input validation
- XSS prevention
- CSRF protection
- Content Security Policy headers

### Backend Security:
- Row Level Security (RLS)
- Authentication required for sensitive operations
- Data encryption in transit and at rest
- API rate limiting

## 📱 Mobile Optimization

### Features:
- Progressive Web App (PWA) ready
- Touch gestures support
- Offline capability preparation
- Mobile-first responsive design

This schema provides a complete overview of your MBSchool website's structure, from the file organization to the database design and deployment configuration.