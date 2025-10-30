## 🧰 Projekthanteringsverktyg

Vi använder **GitHub Projects** som vårt huvudsakliga verktyg för projekthantering.  
Där har vi satt upp en **Kanban board** som ger en tydlig översikt över projektets pågående, planerade och avslutade uppgifter.

Varje uppgift representeras som ett **issue** som flyttas mellan kolumnerna _To Do_, _In Progress_ och _Done_ beroende på status.  
På så sätt kan vi enkelt följa arbetsflödet och se vem som arbetar med vad, samt säkerställa att alla uppgifter har en tydlig ägare och prioritet.

---

## 🌿 Branching Strategy

Vi följer en **Trunk Based Development**-strategi för versionshantering.  
Det innebär att vi utgår från huvudbranchen (**main**) och skapar **korta, isolerade feature-branches** för varje enskilt issue på vår Kanban board.

Varje branch har ett tydligt och beskrivande namn som kopplar till det aktuella issuet, till exempel:
feature/add-login-form
fix/api-error-handling

Den här strategin hjälper oss att:

- Minimera risken för merge-konflikter
- Hålla `main` stabil och alltid i ett fungerande skick
- Möjliggöra snabb integration och frekventa releaser

När en branch är färdig pushas den upp till GitHub och en **Pull Request (PR)** skapas för granskning innan den mergas in i `main`.

---

## 👥 Uppdelning av arbetet

Arbetet delas upp genom **GitHub Issues** på vår Kanban board.  
Varje issue beskriver en tydlig uppgift med tillhörande acceptanskriterier.  
Teammedlemmar tar själva ansvar för de issues som ligger i kolumnen _Ready to Work_ eller _To Do_.

För att säkerställa kodkvalitet och gemensam förståelse följer vi dessa regler:

- Alla ändringar sker i en **egen branch** kopplad till ett issue, går att skapa branchen direkt via issues.
- Varje branch pushas upp till GitHub och en **Pull Request** skapas
- Minst **en annan teammedlem** ska granska och godkänna PR:n innan merge till `main`

På så sätt får vi kontinuerlig kodgranskning, gemensamma beslut och en stabil kodbas.

TODO:
Gå igenom emailet igen och fundera - vad ska vi lägga till för issues och features?
Vad vill vi utforska för tester och ramverk för testning?
Vad vill vi använda för pipeline i våra Github Actions?
Vad har vi för vägar att gå när det kommer till deployment?
