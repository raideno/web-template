# Template

This repository contains a sort of template project that uses includes a backend built using **convex** and vite with **tanstack router** for the frontend.

Multiple features are baked in such as:
- Stripe with **subscription** and **credits usage** supported out of the box.
- Authentication.
- Onboarding.
- Backend analytics and tracking.
- [ ] Frontend analytics and tracking.

## Guide

1. Clone the repository.

2. Setup environment variables.
Duplicate the `.env.example` and rename it to `.env.local`.
Fill in the required environment variables.

3. Run `npm run dev:convex` to link a convex project.
This command will end up crashing due to the environment variables not being set up.

4. Run `npm run convex:dev:push-env`.
This will copy your environment variables from the `.env.local` file over to your convex deployment.

5. `npm run convex:dev` and `npm run frontend:dev`.
