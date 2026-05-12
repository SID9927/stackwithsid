# 🚀 StackWithSid

> The ultimate hub for modern developers: Deep-dive articles, curated interview prep, and powerful tools—all in one premium platform.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

StackWithSid is a full-stack Next.js application built with a focus on **Premium Aesthetics**, **Mobile-First Architecture**, and **High Performance**. It offers developers a central place to learn, prepare for interviews, and connect.

## ✨ Features

- **📖 Deep-Dive Articles:** In-depth technical content on modern web development, system design, and best practices.
- **⚡ Interview Hub:** Curated questions for React, Node.js, DSA, and System Design with difficulty levels and stack filtering.
- **🛠️ Developer Tools:** A handpicked directory of the best tools to boost productivity and workflow.
- **💬 Open Discussions:** Engage with fellow developers through comments and rich interactions.
- **🛡️ Secure Auth & Profiles:** Powered by Supabase, featuring user profiles, article likes, and robust bookmarking functionality.
- **📱 Responsive & Premium UI:** Glassmorphism, smooth animations with Framer Motion, and mobile-optimized layouts designed for touch.
- **🎛️ Admin CMS:** Built-in high-fidelity dashboard for managing articles, interview questions, tech stacks, and global site settings.

## 💻 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Rich Text Editor:** [Tiptap](https://tiptap.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/stackwithsid.git
   cd stackwithsid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Run the SQL scripts provided in the root directory (`supabase_schema.sql`, `supabase_interview_frequent.sql`, etc.) in your Supabase SQL Editor to set up the necessary tables, triggers, and Row Level Security (RLS) policies.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `/src/app` - Next.js App Router pages and API routes.
- `/src/components` - Reusable UI components organized by feature (layout, home, admin, etc.).
- `/src/hooks` - Custom React hooks for shared logic.
- `/src/lib` - Utility functions and Supabase client configuration.
- `/*.sql` - Supabase schema and migration scripts.

## 📄 License

This project is proprietary and closed-source. All rights reserved.
