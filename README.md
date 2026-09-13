# EchoDwell

EchoDwell is a MERN rental marketplace and property-management platform under Echo8V. It connects house seekers with verified property owners, authorized agents and agencies.

## Stack

- React, Vite and Tailwind CSS
- Node.js and Express
- MongoDB with Mongoose and geospatial search
- Paystack for activation and renewal payments
- Cloudinary for property media
- Socket.IO for live conversation updates

## Local setup

1. Install Node.js 20+ and MongoDB, or create a MongoDB Atlas database.
2. Run `npm install` from the project root.
3. Copy `backend/.env.example` to `backend/.env` and add your credentials.
4. Copy `frontend/.env.example` to `frontend/.env`.
5. Run `npm run seed:admin` to create the first platform administrator.
6. Run `npm run dev`.
7. Open `http://localhost:5173`.

The API runs at `http://localhost:5000`.

## Important payment behavior

Activation includes the first month. After expiry, organizations receive a 14-day grace period. When that ends, listings are hidden while dashboard access and data remain available. Paystack secrets must only be stored in the backend environment file.

## Scripts

- `npm run dev` — start frontend and backend
- `npm run build` — create the frontend production build
- `npm test` — run backend tests
- `npm run seed:admin` — create or update the platform admin from environment values
