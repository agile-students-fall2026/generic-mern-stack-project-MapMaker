# Project Repository
## Project Description 
MapMaker is a website where users can describe a map they want in plain English and instantly generate a clean & editable graphic. Our MVP will accomplish six things which consist of creating an interactive map, creating a robust design/template system, ensuring accuracy through AI research & country matching, allowing for editing & overrides, creating accounts & community maps, and finally exporting/sharing maps as pngs. 

## Core Team Members
[Georgi](https://github.com/gp2479)

[Bhavya](https://github.com/bhavya20051)

[Sean](https://github.com/seankimh)

[Vincent](https://github.com/vincentcamp)


## History

[Initial_Project_Proposal](https://github.com/gp2479/project-proposal)


## Other Important Documents
[UX_Design](https://github.com/agile-students-fall2026/generic-mern-stack-project-MapMaker/blob/master/UX-DESIGN.md) 

Link to conceptual wireframes and sitemap visuals of app

[Contributing](https://github.com/agile-students-fall2026/generic-mern-stack-project-MapMaker/blob/master/CONTRIBUTING.md)

Directions for how to contribute to this project



## Setup and Testing

Use Node.js 20.19+ or 22.12+ (or newer). Run these commands in two terminals:

**Backend (Express):**

```sh
cd back-end
npm install
npm start
```

**Frontend (React):**

```sh
cd front-end
npm install
npm run dev
```

Open the address shown by Vite (normally `http://localhost:5173`). Vite forwards `/api` requests to Express on port 3001. You can also run `npm run build` in `front-end` and open `http://localhost:3001` to view the production build served by Express.

Registration and login use Express routes `/api/register` and `/api/login`. Maps, historical map searches, and chat also use `/api` routes. The Sprint 2 server stores users and maps in memory, so they disappear on restart. Passwords are hashed, but there are no login sessions or database yet. Chat returns a mock response; historical searches use the public Wikimedia Commons API.

**Run backend tests and coverage:**

```sh
cd back-end
npm test
npm run coverage
```

Mocha, Chai and c8 are used for testing. Never commit passwords, `.env` files or API keys.

