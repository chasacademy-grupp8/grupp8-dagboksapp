# Journal App - Student Assignment Starter

A minimalist journaling application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This project serves as a starting point for students to practice debugging, adding features, and improving existing code.

## Tech Stack

- **Frontend Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (Authentication + PostgreSQL)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dagboks-appen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  **Skapa ett nytt projekt** på [Supabase](https://supabase.com).
2.  **Kör SQL-scheman:** Gå till `SQL Editor` i ditt Supabase-projekt.
    - Kör först allt innehåll från `supabase/schema.sql` för att skapa grundtabellerna.
    - Kör därefter innehållet från `src/supabase/migrations/20251111_add_tags.sql` för att lägga till tabellerna för tagg-funktionen.
3.  **Konfigurera miljövariabler:**
    - Kopiera filen `.env.example` till en ny fil med namnet `.env.local`.
    - Hitta dina API-nycklar under `Project Settings > API` i Supabase och klistra in dem i `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Design Philosophy

This app follows a minimalist, editorial design approach:

- **Typography:** Serif fonts for headings, sans-serif for body text
- **Color Palette:** Cream backgrounds with dark brown text and warm gray accents
- **Spacing:** Generous whitespace for readability
- **Layout:** Clean, centered layouts with maximum content width
- **Interaction:** Subtle hover states and transitions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

# docker commands

```Build
docker build -t dagboksapp .
```

```Container
docker run -p 3000:3000 dagboksapp
```

## Fyll på med era reflektioner nedan!

#### Reflektioner kring Issue #7

**_Reflektion av Kemal Guclu:_**

Arbetet med tagg-funktionen blev en omfattande men lärorik process som berörde flera viktiga områden:

- **Databas & Backend:** Utvecklingen krävde nya databastabeller (`tags`, `entries_tags`) och uppdaterad backend-logik i Supabase för att hantera relationerna mellan inlägg och taggar.
- **Frontend:** Gränssnittet byggdes ut med ett nytt fält för taggar i formulären (för att skapa/redigera inlägg) samt logik för att visa taggarna på inläggskorten.
- **Git-hygien:** En stor omstrukturering av Git-historiken genomfördes för att skapa rena, logiska commits som är lätta att följa.
- **Säkerhet:** En `.env.local`-fil raderades från hela Git-historiken med `git filter-branch` för att förhindra att känslig data ligger kvar i repot.
- **Dokumentation:** En detaljerad pull request-mall skapades för att underlätta granskning och standardisera framtida PRs.

Processen understryker vikten av att se bortom enbart funktionen och även fokusera på kodkvalitet, säkerhet och en ren projekthistorik.

---

#### Reflektioner kring [Issue/Ämne]

**_Reflektion av [Ditt Namn]:_**

- [Skriv dina reflektioner här som en punktlista...]
