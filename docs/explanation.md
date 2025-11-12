## 🧰 Projekthanteringsverktyg

Vi använder **GitHub Projects** som vårt huvudsakliga verktyg för projekthantering.  
Där har vi satt upp en **Kanban board** som ger en tydlig översikt över projektets pågående, planerade och avslutade uppgifter.

Varje uppgift representeras som ett **issue** som flyttas mellan kolumnerna _Backlog_, _Ready_, _In Progress_ och _Done_ beroende på status.  
På så sätt kan vi enkelt följa arbetsflödet och se vem som arbetar med vad, samt säkerställa att alla uppgifter har en tydlig ägare och prioritet.

---

## 🌿 Branching Strategy

Vi följer en **Trunk Based Development**-strategi för versionshantering.  
Det innebär att vi utgår från huvudbranchen (**main**) och skapar **korta, isolerade feature branches** för varje enskilt issue på vår Kanban board.

Varje branch har ett tydligt och beskrivande namn som kopplar till det aktuella issuet, till exempel:

- `feature/add-login-form`
- `fix/api-error-handling`

Den här strategin hjälper oss att:

- Minimera risken för merge-konflikter
- Hålla `main` stabil och alltid i ett fungerande skick
- Möjliggöra snabb integration och frekventa releaser

När en branch är färdig pushas den upp till GitHub och en **Pull Request (PR)** skapas för granskning innan den mergas in i `main`.

---

## 👥 Uppdelning av arbetet

Arbetet delas upp genom **GitHub Issues** på vår Kanban board.  
Varje issue beskriver en tydlig uppgift med tillhörande acceptanskriterier.  
Teammedlemmar tar själva ansvar för de issues som ligger i kolumnen _Ready_ eller _In Progress_.

För att säkerställa kodkvalitet och gemensam förståelse följer vi dessa regler:

- Alla ändringar sker i en **egen branch** kopplad till ett issue, går att skapa branchen direkt via issues.
- Varje branch pushas upp till GitHub och en **Pull Request** skapas
- Minst **en annan teammedlem** ska granska och godkänna PR:n innan merge till `main`

På så sätt får vi kontinuerlig kodgranskning, gemensamma beslut och en stabil kodbas.

---

## 📝 Commit-historik

Vi skriver **tydliga och beskrivande commit-meddelanden** som gör det enkelt att förstå vad som ändrats utan att behöva granska koden.

Commits bör följa ett enkelt format:

- `feat: beskrivning av ny feature`
- `fix: beskrivning av bugfix`
- `refactor: beskrivning av omstrukturering`
- `docs: uppdatering av dokumentation`
- `test: tillägg av tester`

Genom tydliga commits blir det mycket lättare för teamet att navigera i git-historiken, granska ändringar i PRs och förstå varför vissa beslut togs tidigare. Det är också super användbart när man behöver göra en `git bisect` för att hitta när en bug introducerades!

---

## 🔍 Code Reviews & Pull Requests

Varje PR är en chans för teamet att lära av varandra och säkerställa kodkvalitet. Processen är simpel:

1. Du pushar din branch och öppnar en PR
2. En eller flera teammedlemmar granskar koden
3. Diskussioner och förbättringar sker i PR-kommentarerna
4. Efter godkännande mergas branchen in i `main`

Vi använder även **AI-assisterad kodgranskning** när det är relevant – det kan både snabba upp processen och fånga upp edge cases som lätt glöms bort.

---

## 🐳 Docker & Lokal Setup

För att säkerställa att alla kan köra projektet på samma sätt har vi satt upp **Docker**.

```bash
# Bygga Docker-imagen
docker build -t dagboksapp .

# Köra containern lokalt
docker run -p 3000:3000 dagboksapp
```

Dockerfilen definierar exakt vilken Node-version vi använder, hur dependencies installeras och hur appen startar.

---

## 🧪 Testning med Jest

Vi använder **Jest** för att köra enhetstester och integrationstester. Det hjälper oss att fånga buggar tidigt och säkerställa att refactoring inte förstör befintlig funktionalitet.

```bash
# Köra alla tester
npm test

# Köra tester i watch-mode (utveckling)
npm test -- --watch

# Köra tester med coverage-rapport
npm test -- --coverage
```

Testerna körs även automatiskt i vår CI/CD-pipeline (se nedan), så ingen PR kan mergas om testerna inte går igenom.

**Om AI användes för testgenering:** De flesta testerna är skrivna av AI men alltid granskade av teamet för att säkerställa att de faktiskt testar rätt saker.

---

## ⚙️ GitHub Actions & CI/CD-Pipeline

Vi använder **GitHub Actions** för att automatisera vår **Continuous Integration/Continuous Deployment (CI/CD)** pipeline.

### Vad gör vår pipeline?

Varje gång någon pushar kod eller öppnar en PR kör vår workflow automatiskt:

1. **Install dependencies** – npm installerar alla packages
2. **Lint & format checks** – ESLint säkerställer kodkvalitet
3. **Run tests** – Jest kör alla tester
4. **Build check** – Vi bygger appen för att se att den inte brister vid kompilering
5. **Docker build** – Vi bygger Docker-imagen för att säkerställa att den går att containerisera

Om något av dessa steg misslyckas, kan PRn inte mergas.

### Varför är detta viktigt?

- **Konsistens:** Vi vet att `main`-branchen alltid kan byggas och testas utan att behöva göra något manuellt
- **Snabb feedback:** Utvecklare får återkoppling på sitt arbete inom minuter, inte timmar
- **Automatisk quality gate:** Dålig kod kan inte snillas in i produktionen
- **Transparans:** Det är möjligt för alla att se varför en build misslyckades

---

## 🚀 Avancerad CI/CD – Framtidsvision

I framtiden skulle vi kunna vidareutveckla pipelinen med:

- **Automated deployment** – När en PR mergas till `main`, deployas appen automatiskt till staging/production
- **Performance testing** – Mäta om nya ändringar gör appen långsammare
- **Security scanning** – Automatisk kontroll för kända säkerhetshål i dependencies

---

## 🤖 AI-användning i projektet

Vi använder AI-assistans för att:

- **Snabba upp kodgranskning** – Hitta potentiella buggar och style-issues innan mänsklig review
- **Testa generering av boilerplate** – Spara tid på repetitiva test-setups
- **Dokumentation** – Assistans vid skrivning av clear commit-messages och PR-beskrivningar
- **Brainstorming** – Diskutera arkitektur och best practices

**Men:** All AI-genererad kod granskas alltid manuellt av teamet innan den mergas. ✨
