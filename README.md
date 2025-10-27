Vehicle Service Booking 

which is made by Maftuna(240194), Farangiz(240199) and Sarvar(240091)

## Switching to PostgreSQL

This project defaults to using SQLite for local development. To use PostgreSQL instead:

1. Install Postgres and create a database (for example `vehicle_service_db`).
2. Set the `DATABASE_URL` environment variable (or set `DB_CLIENT=pg` and provide individual PG_* vars). Example:

	DATABASE_URL=postgres://user:password@localhost:5432/vehicle_service_db

3. Run the SQL schema to create tables and seed sample data:

	psql $DATABASE_URL -f backend/config/schema.sql

4. Start the server normally (`npm start`). The app will detect `DATABASE_URL` and use PostgreSQL.

Notes:
- When running in production you must set `JWT_SECRET`.
- If you prefer sqlite, leave `DB_CLIENT` unset or set `DB_CLIENT=sqlite`.
