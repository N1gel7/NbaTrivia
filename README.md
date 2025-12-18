# 🏀 NBA Trivia Application

A full-stack web application that tests users' knowledge of NBA history, players, and statistics through multiple engaging game modes. Built with React, Node.js, and Postgres

## 📋 Table of Contents

- [Overview](#overview)
- [Target Users](#target-users)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [Security Measures](#security-measures)
- [Game Modes](#game-modes)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## 🎯 Overview

NBA Trivia is an interactive quiz application designed for basketball enthusiasts to test and improve their knowledge of NBA history, players, and statistics. The application features multiple game modes, user authentication, progress tracking, leaderboards, and an admin panel for content management.

### Purpose

- **Educational**: Help users learn NBA history and player statistics in an engaging way
- **Competitive**: Enable users to compete on leaderboards and track their progress
- **Interactive**: Provide multiple game modes to keep the experience fresh and challenging
- **Community**: Build a community of NBA fans through shared knowledge and competition

---

## 👥 Target Users

### Primary Users
- **NBA Fans**: Basketball enthusiasts who want to test their knowledge
- **Casual Players**: Users looking for quick, fun trivia games
- **Competitive Players**: Users who enjoy competing on leaderboards and tracking stats

### Secondary Users
- **Administrators**: Content managers who add and maintain trivia questions
- **Educators**: Teachers using the platform for sports history education

---

## ✨ Features

### User Features
- **Multiple Game Modes**:
  - NBA Trivia Quiz (multiple choice questions)
  - NBA History Quiz (historical facts and events)
  - Guess the Player (identify players from clues)
  - MVP Speed Challenge (type MVP winners against the clock)

- **User Accounts**:
  - Secure registration and login
  - Password reset with security questions
  - Profile management
  - Progress tracking

- **Statistics & Progress**:
  - Personal best scores per game mode
  - Overall accuracy and performance metrics
  - Daily streak tracking
  - Global leaderboard rankings

- **Social Features**:
  - Share scores on social media
  - View global leaderboards
  - Compare stats with other players

- **Achievements System**:
  - Unlock achievements for milestones
  - Track achievement progress
  - Display earned badges

- **Enhanced UX**:
  - Sound effects for correct/incorrect answers
  - Confetti animations for perfect scores
  - Responsive design for all devices
  - Dark/light theme support

### Admin Features
- **Question Management**:
  - Add, edit, and delete trivia questions
  - Filter and search questions
  - Categorize by difficulty and type
  - Bulk operations support

- **Content Organization**:
  - View question statistics
  - Monitor question distribution
  - Manage game content across all modes

---

## 🛠 Technology Stack

### Frontend
- **React** (v18+) - UI framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Canvas Confetti** - Celebration animations
- **js-cookie** - Cookie management

### Backend
- **Node.js** - Runtime environment
- **Vercel Serverless Functions** - API hosting
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Nodemailer** - Email functionality

### Database
- **Supabase** (PostgreSQL) - Database and authentication
- **Supabase Client** - Database queries

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Email service credentials (for password reset)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd NbaTrivia/code
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Optional: Skip security checks in development
SKIP_SECURITY_CHECK=false
```

4. **Set up the database**

Run the SQL scripts in your Supabase SQL editor (see [Database Schema](#database-schema) section below).

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

6. **Build for production**
```bash
npm run build
```

---

## 📁 Folder Structure

```
code/
├── api/                          # Serverless API functions
│   ├── forgot-password.js        # Password reset request
│   ├── get-security-question.js  # Retrieve security question
│   ├── login.js                  # User authentication
│   ├── questions.js              # Question CRUD operations
│   ├── register.js               # User registration
│   ├── reset-password.js         # Password reset confirmation
│   └── submit-game.js            # Game score submission
│
├── public/                       # Static assets
│   ├── sounds/                   # Sound effects
│   │   ├── correct.mp3
│   │   ├── wrong.mp3
│   │   └── complete.mp3
│   └── vite.svg
│
├── src/                          # React application source
│   ├── components/               # Reusable components
│   │   ├── admin/                # Admin-specific components
│   │   │   ├── Admin.css
│   │   │   ├── QuestionForm.jsx
│   │   │   └── QuestionList.jsx
│   │   ├── dashboard/            # Dashboard components
│   │   │   ├── GameModeCard.jsx
│   │   │   ├── LeaderboardRow.jsx
│   │   │   └── StatCard.jsx
│   │   ├── game/                 # Game components
│   │   │   ├── GameQuestion.jsx
│   │   │   ├── GameResults.jsx
│   │   │   ├── GuessHistoryList.jsx
│   │   │   └── QuestionReviewList.jsx
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ShareButton.jsx       # Social sharing
│   │   └── Skeleton.jsx          # Loading placeholders
│   │
│   ├── pages/                    # Page components
│   │   ├── AdminDashboard.jsx    # Admin panel
│   │   ├── Dashboard.jsx         # User dashboard
│   │   ├── ForgotPassword.jsx    # Password recovery
│   │   ├── GuessPlayer.jsx       # Guess the Player game
│   │   ├── Login.jsx             # Login page
│   │   ├── MVPSpeed.jsx          # MVP Speed Challenge
│   │   ├── Profile.jsx           # User profile
│   │   ├── Register.jsx          # Registration page
│   │   ├── ResetPassword.jsx     # Password reset
│   │   ├── TriviaGame.jsx        # Trivia quiz game
│   │   └── HistoryGame.jsx       # History quiz game
│   │
│   ├── utils/                    # Utility functions
│   │   ├── confetti.js           # Confetti animations
│   │   └── soundManager.js       # Sound effects manager
│   │
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Global app styles
│   ├── index.css                 # Global CSS variables
│   ├── main.jsx                  # App entry point
│   └── supabaseClient.js         # Supabase configuration
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vercel.json                   # Vercel configuration
└── vite.config.js                # Vite configuration
```

---

## 🗄 Database Schema

### Tables Overview

#### 1. **users** - User Accounts
Stores user authentication and profile information.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `username` - Unique username
- `email` - Unique email address
- `first_name` - User's first name
- `last_name` - User's last name
- `password_hash` - Hashed password
- `role` - User role (user/admin)
- `security_question` - Password recovery question
- `security_answer` - Hashed security answer
- `failed_attempts` - Failed login count
- `locked_until` - Account lockout timestamp
- `join_date` - Account creation date
- `last_active` - Last activity timestamp

**Purpose**: Manages user authentication, profiles, and account security

---

#### 2. **user_global_stats** - Overall User Statistics
Tracks aggregate performance metrics across all game modes.

**Attributes**:
- `user_id` - References users table (Primary Key)
- `total_points` - Cumulative points earned
- `total_questions` - Total questions answered
- `daily_streak` - Consecutive days played
- `avg_score` - Average accuracy percentage
- `hours_played` - Total time spent playing
- `current_rank` - Global leaderboard position

**Purpose**: Aggregates performance across all games and calculates global rankings

---

#### 3. **user_game_mode_stats** - Per-Game-Mode Statistics
Stores performance data for each individual game mode.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `user_id` - References users table
- `game_mode` - Game type (trivia, history, guess_player, mvp_speed)
- `games_played` - Number of games completed
- `best_score` - Personal best for this mode
- `current_streak` - Current winning streak
- `success_rate` - Win percentage

**Purpose**: Tracks personal bests and statistics per game mode

---

#### 4. **game_sessions** - Game History
Logs every completed game session for analytics.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `user_id` - References users table
- `game_mode` - Type of game played
- `score` - Points earned in session
- `played_at` - Timestamp of game completion

**Purpose**: Maintains complete game history and enables analytics

---

#### 5. **questions** - Trivia Questions
Stores all trivia and history quiz questions.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `category` - Question category (Trivia, History)
- `question` - Question text
- `options` - Array of answer choices (JSONB)
- `correct` - Index of correct answer (0-3)
- `difficulty` - Difficulty level (1=Easy, 2=Medium, 3=Hard)
- `points` - Points awarded (10/20/30)
- `fact` - Fun fact displayed after answer

**Purpose**: Powers trivia and history quiz game modes

---

#### 6. **guess_player_questions** - Player Identification Game
Stores player profiles with clues for the guessing game.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `first_name` - Player's first name
- `last_name` - Player's last name
- `clues` - Array of progressive hints (JSONB)
- `stats` - Career statistics text

**Purpose**: Powers "Guess the Player" game mode with progressive clue revelation

---

#### 7. **mvp_winners** - MVP Award Winners
Historical record of NBA MVP award recipients.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `year` - Award year
- `first_name` - MVP's first name
- `last_name` - MVP's last name
- `team` - Team name

**Purpose**: Powers MVP Speed Challenge game and validates answers

---

#### 8. **achievements** - Achievement Definitions
Defines available achievements users can earn.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `name` - Achievement name
- `description` - Achievement description
- `icon` - Emoji or icon representation

**Purpose**: Defines achievement criteria and metadata for gamification

---

#### 9. **user_achievements** - Earned Achievements
Tracks which achievements each user has earned.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `user_id` - References users table
- `achievement_id` - References achievements table
- `earned_at` - Timestamp when earned

**Purpose**: Links users to their earned achievements and prevents duplicates

---

#### 10. **password_resets** - Password Reset Tokens
Manages password reset requests and tokens.

**Attributes**:
- `id` - Unique identifier (Primary Key)
- `user_id` - References users table
- `token` - Secure reset token
- `expires_at` - Token expiration time
- `created_at` - Request timestamp

**Purpose**: Securely manages password reset flow with time-limited tokens

---

## 🔒 Security Measures

### Authentication & Authorization

#### 1. **Password Security**
- **Hashing**: All passwords are hashed using `bcryptjs` with salt rounds
- **Strength Requirements**: Enforced password policy requiring:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **No Plain Text Storage**: Passwords are never stored in plain text

#### 2. **JWT Token Authentication**
- **Secure Token Generation**: Uses `jsonwebtoken` with secret key
- **Token Expiration**: Tokens expire after 24 hours
- **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies (not accessible via JavaScript)
- **Role-Based Access**: JWT payload includes user role for authorization
- **Token Validation**: All protected routes verify JWT before processing

#### 3. **Account Lockout Protection**
- **Failed Login Tracking**: Tracks failed login attempts per user
- **Automatic Lockout**: Account locked for 15 minutes after 5 failed attempts
- **Lockout Timer**: Client-side countdown display for locked accounts
- **Reset on Success**: Failed attempt counter resets on successful login

### Input Validation & Sanitization

#### 4. **XSS (Cross-Site Scripting) Protection**
- **Input Sanitization**: All user inputs sanitized before database storage
- **Pattern Matching**: Blocks common XSS patterns:
  ```javascript
  const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
  ```
- **API-Level Validation**: All API endpoints validate and sanitize inputs
- **Output Encoding**: React automatically escapes output (prevents XSS)

#### 5. **SQL Injection Prevention**
- **Parameterized Queries**: All database queries use Supabase parameterized queries
- **No String Concatenation**: Never concatenate user input into SQL
- **ORM Protection**: Supabase client library prevents SQL injection
- **Input Type Validation**: Strict type checking on all inputs

### Session & Request Security

#### 6. **CSRF Protection**
- **SameSite Cookies**: Cookies set with `SameSite=Strict` attribute
- **Origin Validation**: API validates request origins
- **Token-Based Auth**: JWT tokens prevent CSRF attacks

#### 7. **Rate Limiting**
- **Client-Side Throttling**: 1-second cooldown between login attempts
- **Server-Side Lockout**: Account lockout after repeated failures
- **Request Validation**: Validates request frequency patterns

### Data Protection

#### 8. **Sensitive Data Handling**
- **Security Questions**: Hashed before storage (not plain text)
- **Password Reset Tokens**: 
  - Cryptographically secure random tokens
  - Time-limited (1 hour expiration)
  - Single-use only (invalidated after use)
- **Email Privacy**: Email addresses validated but not exposed in responses

#### 9. **Role-Based Access Control (RBAC)**
- **Admin Routes**: Protected by role verification
- **JWT Role Claims**: User role embedded in JWT payload
- **API Authorization**: Admin-only endpoints check role before execution
- **Frontend Guards**: Route guards prevent unauthorized access

### API Security

#### 10. **Secure API Design**
- **HTTPS Only**: All API calls use HTTPS in production
- **Error Handling**: Generic error messages (no sensitive data leakage)
- **Input Validation**: All endpoints validate required fields
- **Method Restrictions**: Endpoints only accept appropriate HTTP methods

### Additional Security Features

#### 11. **Email Security**
- **Secure SMTP**: Uses TLS for email transmission
- **App-Specific Passwords**: Email service uses app passwords (not account password)
- **Rate Limiting**: Password reset requests limited per user

#### 12. **Environment Security**
- **Environment Variables**: All secrets stored in `.env` file
- **No Hardcoded Secrets**: No API keys or passwords in source code
- **Git Ignore**: `.env` file excluded from version control

---

## 🎮 Game Modes

### 1. NBA Trivia Quiz
- **Format**: Multiple choice questions
- **Categories**: General NBA knowledge
- **Difficulty Levels**: Easy (🏀), Medium (🏀🏀), Hard (🏀🏀🏀)
- **Scoring**: Points based on difficulty (10/20/30)
- **Features**: 
  - Fun facts after each answer
  - Question review at end
  - Share score functionality

### 2. NBA History Quiz
- **Format**: Multiple choice questions
- **Focus**: Historical events, records, and milestones
- **Difficulty Levels**: Easy, Medium, Hard
- **Scoring**: Same as Trivia Quiz
- **Features**: Educational facts about NBA history

### 3. Guess the Player
- **Format**: Progressive clue revelation
- **Mechanics**: 
  - 5 clues per player (easier → harder)
  - Reveal clues one at a time
  - Guess at any point
  - Fewer clues used = higher score
- **Scoring**: Points based on clues used
- **Features**: Career statistics display

### 4. MVP Speed Challenge
- **Format**: Type MVP winners against the clock
- **Time Limit**: 60 seconds
- **Mechanics**:
  - Type first and last name
  - Autocomplete validation
  - Real-time score tracking
- **Scoring**: 1 point per correct MVP
- **Features**: Historical MVP data from 1956-2025

---

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user
- `POST /api/forgot-password` - Request password reset
- `GET /api/get-security-question` - Retrieve security question
- `POST /api/reset-password` - Reset password with token

### Game Management
- `POST /api/submit-game` - Submit game results and update stats
- `GET /api/questions` - Fetch quiz questions (admin only)
- `POST /api/questions` - Create new question (admin only)
- `PUT /api/questions` - Update existing question (admin only)
- `DELETE /api/questions` - Delete question (admin only)

---

## 🌍 Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JWT Secret (use a strong random string)
JWT_SECRET=your-secret-key-min-32-characters

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Optional Development Settings
SKIP_SECURITY_CHECK=false
```

### Setting Up Email (Gmail)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App-Specific Password
3. Use the app password in `EMAIL_PASS`

---

## 📊 Key Functionalities

### User Management
- ✅ Secure registration with email verification
- ✅ Login with JWT authentication
- ✅ Password reset via email
- ✅ Security question backup recovery
- ✅ Profile viewing and stats tracking
- ✅ Account lockout after failed attempts

### Game Features
- ✅ Four distinct game modes
- ✅ Real-time score calculation
- ✅ Progress tracking and statistics
- ✅ Personal best records
- ✅ Daily streak tracking
- ✅ Question review after games
- ✅ Sound effects and animations
- ✅ Social sharing capabilities

### Admin Features
- ✅ Question CRUD operations
- ✅ Content filtering and search
- ✅ Question statistics dashboard
- ✅ Difficulty distribution tracking
- ✅ Category management

### Social Features
- ✅ Global leaderboards
- ✅ Score sharing
- ✅ Achievement system
- ✅ Rank tracking

---

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Glassmorphism**: Modern frosted glass aesthetic
- **Smooth Animations**: Transitions and micro-interactions
- **Sound Effects**: Audio feedback for game actions
- **Confetti Celebrations**: Visual rewards for achievements
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: User-friendly error messages
- **Accessibility**: Keyboard navigation and ARIA labels

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Developer

Developed as a full-stack NBA trivia application showcasing modern web development practices, secure authentication, and engaging user experience design.

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

**Enjoy testing your NBA knowledge! 🏀**
