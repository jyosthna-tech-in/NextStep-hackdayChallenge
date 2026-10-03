# 🧭 GuideEase

**An AI-powered accessibility assistant that decodes complex public spaces.** 
Built for the **Best Use of Gemma 4** Challenge.
https://next-step-hackday-challenge.vercel.app/)
[![Deployed on Vercel](](
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 💡 The Problem
Navigating hospitals, government offices, or transit hubs can be overwhelming. Confusing noticeboards, complex forms, and vague queue displays create friction—especially for the elderly or those with language barriers.

## 🚀 The Solution
GuideEase allows users to point their phone at a confusing notice or queue and ask a question in their native language. Powered by **Gemma 4's multimodal intelligence** (`gemma-4-26b-a4b-it`) via the Gemini API, the app instantly provides:
1. **Situation Summary:** A clear explanation of what is happening.
2. **Required Documents:** A list of items needed for the task.
3. **Action Journey:** A simple, 3-step action plan in the user's preferred local language (Hindi, Telugu, Tamil, Kannada, English).

### Key Features (MVP)
* **Multimodal Input:** Capture images directly from the camera or upload files.
* **Native Voice Queries:** Ask questions naturally using browser-based Speech-to-Text.
* **Regional Language Support:** Translations and localized context for diverse users.
* **Accessibility First:** Integrated Text-to-Speech to read instructions aloud.

## 🛠️ Tech Stack
* **AI Model:** Gemma 4 (`gemma-4-26b-a4b-it`) via `@google/genai` SDK
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Icons:** Lucide React
* **Deployment:** Vercel

