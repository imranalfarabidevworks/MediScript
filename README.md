# MediScript — AI-Powered Prescription & Health Analytics System

A modern full-stack frontend prototype built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v3**, and **NextUI v2**.

## 🚀 Features

### 🟢 Patient Portal (`/patient`)
- Drag-and-drop prescription upload (PNG, JPEG, WEBP, PDF)
- **AI-powered extraction** via Gemini 1.5 Flash API
- Extracts: Doctor name, date, symptoms, medicines (with category), vitals, test results
- Saves records to `localStorage` with date-wise organization
- View full history with expandable consultation details

### 🔵 Doctor Portal (`/doctor`)
- Search patients by Patient ID
- Lifetime **Antibiotic Tracker** with usage count & date history
- Category breakdown: Antibiotics, Vitamins, Calcium, Gastric
- Full diagnostic test history in sortable table
- Consultation timeline with deep-dive view

### 🔴 Admin Portal (`/admin`)
- System stats dashboard (patients, doctors, records, AI parses)
- Register / suspend / delete patients and doctors
- **Inject mock data** for instant demo testing
- **Clear all localStorage** with confirmation dialog
- **Export JSON** backup of all data
- Real-time audit log viewer

## 🏗️ Tech Stack

| Tech | Version |
|------|---------|
| Next.js | 16.x (App Router) |
| TypeScript | Strict, zero `any` |
| Tailwind CSS | v3 |
| NextUI | v2 |
| Gemini API | 1.5 Flash |
| Storage | Browser localStorage |

## 📁 Project Structure

```
src/
├── app/
│   ├── patient/page.tsx      # Patient Portal
│   ├── doctor/page.tsx       # Doctor Portal
│   ├── admin/page.tsx        # Admin Portal
│   ├── layout.tsx            # Root layout + Sidebar
│   └── globals.css
├── components/
│   └── ui/
│       ├── Sidebar.tsx       # Navigation sidebar
│       └── Providers.tsx     # NextUI provider
├── lib/
│   ├── gemini.ts             # AI integration + prompt engineering
│   ├── storage.ts            # localStorage CRUD utilities
│   └── utils.ts              # Helpers, formatters, color maps
└── types/
    └── index.ts              # All TypeScript interfaces (strict)
```

## ⚙️ Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Gemini API Key

Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and paste it in the Patient Portal.

## 🧪 Quick Demo

1. Go to **Admin Portal** → click **Inject Mock Data**
2. Go to **Doctor Portal** → search `PAT-001`
3. View full analytics dashboard
4. Go to **Patient Portal** → enter `PAT-001` + your Gemini key → upload a prescription image
