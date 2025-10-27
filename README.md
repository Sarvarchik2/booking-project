# 🚗 Vehicle Service Booking System

A comprehensive full-stack web application for managing vehicle service bookings with customer registration, service scheduling, mechanic assignment, invoice management, and feedback system.

## 📋 Features

### Customer Features
- ✅ Customer registration and authentication (JWT-based)
- 🚗 Vehicle management (add, update, delete vehicles)
- 📅 Service booking and scheduling
- 📊 View booking history
- 💰 Invoice viewing and payment tracking
- ⭐ Feedback and rating system
- 📈 Dashboard with service statistics

### Administrative Features
- 👨‍🔧 Mechanic management and assignment
- 🛠️ Service type management
- 💳 Invoice generation with itemized billing
- 📝 Customer history tracking
- 📊 Comprehensive reporting

## 🏗️ Technology Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation

### Frontend
- **React** 18+ - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

## 📁 Project Structure

```
vehicle-service-booking-system/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   └── schema.sql            # Database schema
│   ├── routes/
│   │   ├── customers.js          # Customer endpoints
│   │   ├── vehicles.js           # Vehicle endpoints
│   │   ├── bookings.js           # Booking endpoints
│   │   ├── mechanics.js          # Mechanic endpoints
│   │   ├── invoices.js           # Invoice endpoints
│   │   ├── feedback.js           # Feedback endpoints
│   │   └── serviceTypes.js       # Service type endpoints
│   └── server.js                 # Express server
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── CustomerRegistration.js
│       │   ├── CustomerLogin.js
│       │   ├── Dashboard.js
│       │   ├── VehicleList.js
│       │   ├── BookingForm.js
│       │   ├── BookingList.js
│       │   ├── InvoiceList.js
│       │   ├── FeedbackForm.js
│       │   └── CustomerHistory.js
│       ├── services/
│       │   └── api.js            # API client
│       ├── App.js
│       ├── index.js
│       └── index.css
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd project
```

### Step 2: Database Setup

1. Create a PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE vehicle_service_db;
\q
```

2. Run the schema to create tables:
```bash
psql -U postgres -d vehicle_service_db -f backend/config/schema.sql
```

### Step 3: Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Create environment configuration:
```bash
cp .env.example .env
```

3. Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=vehicle_service_db
PORT=5000
JWT_SECRET=your_secret_key_change_this
```

### Step 4: Frontend Setup

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

### Step 5: Run the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

#### Option 2: Run Concurrently
```bash
npm run dev-all
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 📡 API Endpoints

### Customer Endpoints
- `POST /api/customers/register` - Register new customer
- `POST /api/customers/login` - Customer login
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/history` - Get customer history
- `PUT /api/customers/:id` - Update customer profile

### Vehicle Endpoints
- `GET /api/vehicles/customer/:customerId` - Get all vehicles for a customer
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Booking Endpoints
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/assign-mechanic` - Assign mechanic to booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Mechanic Endpoints
- `GET /api/mechanics` - Get all mechanics
- `GET /api/mechanics/:id` - Get mechanic details
- `GET /api/mechanics/:id/bookings` - Get mechanic's bookings
- `POST /api/mechanics` - Add new mechanic
- `PUT /api/mechanics/:id` - Update mechanic
- `DELETE /api/mechanics/:id` - Delete mechanic

### Invoice Endpoints
- `GET /api/invoices` - Get all invoices (with filters)
- `GET /api/invoices/:id` - Get invoice with items
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id/payment` - Update payment status
- `DELETE /api/invoices/:id` - Delete invoice

### Feedback Endpoints
- `GET /api/feedback` - Get all feedback (with filters)
- `GET /api/feedback/:id` - Get feedback details
- `GET /api/feedback/mechanic/:mechanicId/average` - Get mechanic average rating
- `POST /api/feedback` - Submit new feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Service Type Endpoints
- `GET /api/service-types` - Get all service types
- `GET /api/service-types/:id` - Get service type details
- `POST /api/service-types` - Add new service type
- `PUT /api/service-types/:id` - Update service type
- `DELETE /api/service-types/:id` - Delete service type

## 🗄️ Database Schema

### Tables
- **customers** - Customer information and credentials
- **vehicles** - Customer vehicle details
- **service_types** - Available service types and pricing
- **mechanics** - Mechanic information and specializations
- **bookings** - Service bookings and appointments
- **invoices** - Invoice headers
- **invoice_items** - Itemized billing details
- **feedback** - Customer feedback and ratings

## 💻 Usage Guide

### 1. Customer Registration
1. Navigate to the registration page
2. Fill in personal details (name, email, password, phone, address)
3. Submit to create account

### 2. Adding Vehicles
1. Login to your account
2. Go to "My Vehicles"
3. Click "Add Vehicle"
4. Enter vehicle details (make, model, year, VIN, etc.)
5. Save vehicle

### 3. Booking a Service
1. Click "Book Service" from dashboard or navigation
2. Select vehicle from dropdown
3. Choose service type
4. Select date and time
5. Add any additional notes
6. Submit booking

### 4. Viewing Invoices
1. Navigate to "Invoices" section
2. View list of all invoices
3. Click "View" to see detailed invoice
4. Click "Pay Now" for pending invoices

### 5. Submitting Feedback
1. After service completion, go to "Bookings"
2. Find completed booking
3. Click "Give Feedback"
4. Rate service (1-5 stars) and add comments
5. Submit feedback

### 6. Viewing History
1. Go to "History" section
2. Switch between tabs: Bookings, Invoices, Feedback
3. View complete service history

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- CORS configuration
- Environment variable protection

## 🎨 UI Features

- Responsive design for mobile and desktop
- Clean, modern interface
- Status badges for bookings and invoices
- Interactive rating system
- Tabbed navigation for history
- Real-time form validation
- Loading states and error handling

## 📝 Sample Data

The database schema includes sample data:
- 9 predefined service types
- 5 sample mechanics with different specializations

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Building for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions, please create an issue in the repository.

## 🔮 Future Enhancements

- Email notifications for bookings
- SMS reminders
- Payment gateway integration
- Mobile app (React Native)
- Admin dashboard
- Real-time chat support
- Appointment reminders
- Loyalty program
- Multi-language support
- Advanced analytics and reporting

## 📸 Screenshots

### Dashboard
Displays booking statistics and quick actions.

### Vehicle Management
Add, edit, and manage customer vehicles.

### Service Booking
Easy-to-use booking form with service selection.

### Invoice View
Detailed invoices with itemized billing.

### Feedback System
Star rating and comment system for service quality.

---

**Built with ❤️ using Node.js, React, and PostgreSQL**
# booking-project
