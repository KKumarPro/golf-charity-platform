# Digital Heroes: Golf Charity Subscription Platform

A full-stack web application built for the Digital Heroes Trainee Selection Process. [cite_start]This platform combines golf performance tracking, a monthly algorithmic prize draw, and automated charitable giving[cite: 7].

**Live Demo:** [https://golf-app-taupe.vercel.app/]

---

## 🚀 Project Overview

This application was engineered to meet the strict requirements of the Digital Heroes Product Requirements Document (PRD). [cite_start]The platform shifts away from traditional sports aesthetics to deliver a premium, emotion-driven experience focused on real-world charitable impact[cite: 120].

### Key Features & PRD Compliance:

- [cite_start]**Subscription Paywall:** Users must hold an active monthly or yearly premium subscription to log scores and enter the draw[cite: 41].
- [cite_start]**Rolling Score Engine:** Users log Stableford scores (1-45)[cite: 45]. [cite_start]The database automatically trims user histories to retain only the most recent 5 scores[cite: 48, 49].
- [cite_start]**Algorithmic Draw Engine:** The Admin Command Center features a custom draw simulation that can generate random numbers or run an algorithmic draw weighted by the most frequently logged scores across the platform [cite: 57-59].
- [cite_start]**Automated Prize Pools:** Automatically calculates the 40/35/25 prize pool splits based on active subscriber counts and rolls over the jackpot if no 5-number match is found [cite: 70-73].
- [cite_start]**Winner Verification Workflow:** A complete system utilizing Supabase Storage for users to upload screenshot proofs of their scores, which administrators can review and mark as "Paid"[cite: 85].
- [cite_start]**Premium UI/UX:** Built with a dark-mode, glassmorphic design system and enhanced with Framer Motion for subtle, modern interactions that avoid traditional golf clichés[cite: 120, 121].

---

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Animations:** Framer Motion
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe (Simulated for MVP testing)
- **Deployment:** Vercel

---

## 🛠️ Local Setup & Installation

To run this project locally, you will need Node.js and a Supabase account.

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/KKumarPro/golf-charity-platform.git
cd golf-charity-platform
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Configure Environment Variables**
Create a \`.env.local\` file in the root directory and add your Supabase keys:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

**4. Run the development server**
\`\`\`bash
npm run dev
\`\`\`
Navigate to \`http://localhost:3000\` to view the application.

---

## 🧪 Testing Credentials

To explore the Admin Command Center and verify the verification/draw logic, please use the following credentials:

- **Admin Email:** `admin@digitalheroes.com`
- **Password:** '123456789'

---

_Architected and Developed by Karan Kumar._
