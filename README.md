Vehicle Service Booking

Project authors: Maftuna(240194), Farangiz(240199) and Sarvar(240091)

This project is configured to use PostgreSQL only.

Getting started (Postgres)

1. Install Postgres and create a database (for example `vehicle_service_db`).
2. Set the `DATABASE_URL` environment variable. Example:

	DATABASE_URL=postgres://user:password@localhost:5432/vehicle_service_db

3. Run the SQL schema to create tables and seed sample data (the file contains service types and mechanics):

	psql $DATABASE_URL -f backend/config/schema.sql

4. (Optional) To insert additional sample customers, vehicles and bookings run the seed script:

	node backend/seed-test-data.js

5. Start the server:

	npm start

Notes:
- You must set `JWT_SECRET` in production.
- The project no longer supports SQLite — remove any old sqlite DB files if present.
