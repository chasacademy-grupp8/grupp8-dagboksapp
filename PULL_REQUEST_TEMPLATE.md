---
name: Pull Request
about: Mall för att skapa en ny Pull Request.
title: "feat: Implementera tagg-funktionalitet"
labels: enhancement
---

## 🔗 Kopplat Issue

Closes #7: Taggar på inlägg

## 📝 Beskrivning

Denna Pull Request implementerar funktionalitet för att addera, visa och redigera taggar på dagboksinlägg. Syftet är att låta användare kategorisera sina inlägg efter t.ex. humör, projekt eller ämne för enklare organisering och överblick.

## ✨ Större Förändringar

- **Databas:** Nytt schema med `tags` och `entries_tags`-tabeller för att hantera relationen mellan inlägg och taggar.
- **Backend:** Uppdaterade Supabase-queries (`queries.ts`) för att hantera CRUD-operationer (Create, Read, Update, Delete) för taggar.
- **UI - Skapa & Redigera:** Formulären för att skapa och redigera inlägg har utökats med ett fält för att mata in en kommaseparerad lista med taggar.
- **UI - Visning:** Inläggskort (`EntryCard.tsx`) visar nu de taggar som är associerade med varje inlägg.
- **Git-historik:** En omfattande rensning och omstrukturering av Git-historiken har genomförts för att skapa en ren, logisk och professionell commit-historik.

## 🧪 Hur man Testar

1.  **Logga in:** Starta applikationen och logga in med ett befintligt konto eller skapa ett nytt.
2.  **Skapa Inlägg med Taggar:**
    - Navigera till `/new-entry`.
    - Fyll i titel och innehåll.
    - I tagg-fältet, skriv in några taggar separerade med kommatecken (t.ex. `tacksamhet, jobb, idéer`).
    - Spara inlägget.
3.  **Verifiera Visning:**
    - Kontrollera att det nya inlägget visas på din dashboard.
    - Verifiera att taggarna (`#tacksamhet`, `#jobb`, `#idéer`) visas korrekt på inläggets kort.
4.  **Redigera Inlägg och Taggar:**
    - Klicka på "Edit" på det nyskapade inlägget.
    - Ändra texten och lägg till/ta bort/ändra taggarna i tagg-fältet.
    - Spara ändringarna.
5.  **Verifiera Uppdatering:**
    - Kontrollera att inlägget på dashboarden nu visar de uppdaterade taggarna.

## 🗃️ Databas & Migration

För att databasen ska fungera med denna nya funktionalitet måste en migrering köras.

1.  **Hitta Migreringen:** SQL-koden finns i filen `src/supabase/migrations/20251111_add_tags.sql`.
2.  **Kör i Supabase:** Gå till din Supabase-projekts "SQL Editor" och klistra in hela innehållet från filen. Klicka på "RUN" för att skapa de nya tabellerna (`tags`, `entries_tags`) och deras policies.

## 🚀 Kör Lokalt

För att köra projektet lokalt efter att ha klonat repot:

1.  **Installera beroenden:**
    ```bash
    npm install
    ```
2.  **Skapa miljöfil:**
    - Skapa en fil i roten med namnet `.env.local`.
    - Lägg till dina Supabase-nycklar i filen:
      ```
      NEXT_PUBLIC_SUPABASE_URL=din-url-här
      NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key-här
      ```
3.  **Starta utvecklingsservern:**
    ```bash
    npm run dev
    ```
