

Set your DATABASE_URL first. Example:

    export DATABASE_URL=postgres://user:password@localhost:5432/vehicle_service_db

Run schema (creates tables and seeds service types & mechanics):

    psql $DATABASE_URL -f backend/config/schema.sql

Optionally seed test data (customers, vehicles, bookings, invoices, feedback):

    node backend/seed-test-data.js

Start backend server:

    PORT=5001 node backend/server.js

Start frontend (in separate terminal):

    ./start-frontend.sh
