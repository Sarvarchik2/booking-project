

cd /Users/student/Desktop/project
rm -f backend/vehicle_service.db

node backend/seed-test-data.js

PORT=5001 node backend/server.js

/Users/student/Desktop/project/start-frontend.sh
