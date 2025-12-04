# 📋 PROJECT EXHIBITION POSTER INFORMATION

## 🎯 1. TEAM INFORMATION

### Team Name:
**Database Masters** *(you can change this)*

### Team Members:
1. **Maftuna** - ID: 240194
2. **Farangiz** - ID: 240199  
3. **Sarvar** - ID: 240091

---

## 📌 2. PROJECT TITLE

### Main Title:
**Vehicle Service Booking System**

### Alternative Short Title:
**AutoService Manager**

---

## ⚙️ 3. FEATURES AND TOOLS USED

### 🎯 Main System Features:

#### For Customers:
1. **Registration & Authentication** - create account with secure password storage
2. **Vehicle Management** - add, edit, and delete vehicle information
3. **Service Booking** - select date, time, and service type
4. **Booking History** - track status of current and past appointments
5. **Invoice & Payment Management** - view and pay invoices
6. **Leave Feedback** - rate service quality (1-5 star rating)

#### For Mechanics:
1. **Schedule Management** - view assigned jobs
2. **Work Status Updates** - mark service completion
3. **Personal Profile** - manage profile and specialization

#### Administrative Features:
1. **Service Type Management** - add and edit services with pricing
2. **Staff Management** - add mechanics with specializations
3. **Invoice Generation** - automatic invoice creation with tax calculation
4. **Analytics & Reporting** - statistics on bookings and revenue

---

### 🛠️ Technologies Used:

#### Backend (Server-side):
- **Node.js** v16.20.2 - JavaScript runtime environment
- **Express.js** v4.18.2 - web framework for building REST API
- **PostgreSQL 14** - relational database management system
- **pg** v8.11.1 - PostgreSQL driver for Node.js

#### Frontend (Client-side):
- **React** v18.2.0 - UI library for building interfaces
- **React Router** v6.20.0 - routing in the application
- **Axios** v1.6.2 - HTTP client for API requests
- **React Scripts** v4.0.3 - build tools

#### Security & Authentication:
- **JWT (jsonwebtoken)** v9.0.2 - tokens for authentication
- **bcryptjs** v2.4.3 - password hashing
- **express-validator** v7.0.1 - input data validation

#### Additional Tools:
- **CORS** v2.8.5 - handling cross-origin requests
- **dotenv** v16.3.1 - environment variable management
- **Nodemon** v3.0.1 - automatic server reload (development)

---

## 📊 4. DATABASE ERD (Entity-Relationship Diagram)

### Entities and their Attributes:

#### 1️⃣ CUSTOMERS (Clients)
- 🔑 **customer_id** (PK) - unique ID
- first_name - first name
- last_name - last name
- email (UNIQUE) - email address
- password_hash - password hash
- phone - phone number
- address - street address
- city - city
- state - state/province
- zip_code - postal code
- created_at - creation date
- updated_at - last update date

#### 2️⃣ VEHICLES (Cars)
- 🔑 **vehicle_id** (PK) - unique ID
- 🔗 customer_id (FK → customers)
- make - manufacturer/brand
- model - model name
- year - year of manufacture
- vin (UNIQUE) - vehicle identification number
- license_plate - license plate number
- color - color
- mileage - odometer reading
- created_at - creation date
- updated_at - last update date

#### 3️⃣ SERVICE_TYPES (Service Types)
- 🔑 **service_type_id** (PK) - unique ID
- name - service name
- description - service description
- base_price - base price
- estimated_duration - estimated duration (minutes)
- is_active - active status
- created_at - creation date

**Service Examples:**
- Oil Change - $49.99
- Brake Inspection - $79.99
- Engine Diagnostic - $99.99
- Transmission Service - $149.99
- Full Service - $299.99

#### 4️⃣ MECHANICS (Service Technicians)
- 🔑 **mechanic_id** (PK) - unique ID
- first_name - first name
- last_name - last name
- email (UNIQUE) - email address
- password_hash - password hash
- phone - phone number
- specialization - area of expertise
- hourly_rate - hourly wage rate
- is_available - availability status
- created_at - creation date
- updated_at - last update date

#### 5️⃣ BOOKINGS (Appointments)
- 🔑 **booking_id** (PK) - unique ID
- 🔗 customer_id (FK → customers)
- 🔗 vehicle_id (FK → vehicles)
- 🔗 service_type_id (FK → service_types)
- 🔗 mechanic_id (FK → mechanics)
- booking_date - appointment date
- booking_time - appointment time
- status - status (scheduled/in_progress/completed/cancelled)
- notes - additional notes
- estimated_completion - estimated completion time
- actual_completion - actual completion time
- created_at - creation date
- updated_at - last update date

#### 6️⃣ INVOICES (Bills)
- 🔑 **invoice_id** (PK) - unique ID
- 🔗 booking_id (FK → bookings)
- 🔗 customer_id (FK → customers)
- invoice_number (UNIQUE) - invoice number
- invoice_date - invoice date
- subtotal - amount before tax
- tax - tax amount
- total - total amount
- payment_status - payment status (pending/paid/cancelled)
- payment_method - payment method
- payment_date - payment date
- notes - additional notes
- created_at - creation date
- updated_at - last update date

#### 7️⃣ INVOICE_ITEMS (Invoice Line Items)
- 🔑 **item_id** (PK) - unique ID
- 🔗 invoice_id (FK → invoices)
- description - item description
- quantity - quantity
- unit_price - price per unit
- total_price - total price
- created_at - creation date

#### 8️⃣ FEEDBACK (Customer Reviews)
- 🔑 **feedback_id** (PK) - unique ID
- 🔗 booking_id (FK → bookings)
- 🔗 customer_id (FK → customers)
- 🔗 mechanic_id (FK → mechanics)
- rating - rating score (1-5)
- comment - review comment
- created_at - creation date

---

### 🔗 RELATIONSHIPS:

1. **CUSTOMERS ↔ VEHICLES** (1:N)
   - One customer can have many vehicles
   - Each vehicle belongs to one customer
   - ON DELETE CASCADE

2. **CUSTOMERS ↔ BOOKINGS** (1:N)
   - One customer can have many bookings
   - Each booking belongs to one customer
   - ON DELETE CASCADE

3. **VEHICLES ↔ BOOKINGS** (1:N)
   - One vehicle can have many bookings
   - Each booking is for one vehicle
   - ON DELETE CASCADE

4. **SERVICE_TYPES ↔ BOOKINGS** (1:N)
   - One service type can be in many bookings
   - Each booking has one service type

5. **MECHANICS ↔ BOOKINGS** (1:N)
   - One mechanic can have many bookings
   - Each booking is assigned to one mechanic
   - ON DELETE SET NULL

6. **BOOKINGS ↔ INVOICES** (1:1)
   - Each booking has one invoice
   - ON DELETE CASCADE

7. **CUSTOMERS ↔ INVOICES** (1:N)
   - One customer can have many invoices
   - ON DELETE CASCADE

8. **INVOICES ↔ INVOICE_ITEMS** (1:N)
   - One invoice can have many line items
   - ON DELETE CASCADE

9. **BOOKINGS ↔ FEEDBACK** (1:N)
   - One booking can have feedback
   - ON DELETE CASCADE

10. **CUSTOMERS ↔ FEEDBACK** (1:N)
    - One customer can leave many reviews
    - ON DELETE CASCADE

11. **MECHANICS ↔ FEEDBACK** (1:N)
    - One mechanic can receive many reviews
    - ON DELETE SET NULL

---

### 📈 INDEXES for Optimization:

- `idx_customers_email` - on customers(email)
- `idx_vehicles_customer` - on vehicles(customer_id)
- `idx_bookings_customer` - on bookings(customer_id)
- `idx_bookings_date` - on bookings(booking_date)
- `idx_bookings_status` - on bookings(status)
- `idx_invoices_customer` - on invoices(customer_id)
- `idx_invoices_booking` - on invoices(booking_id)
- `idx_feedback_customer` - on feedback(customer_id)

---

## 🎨 VISUAL ERD REPRESENTATION:

### Diagram Structure:

```
┌─────────────┐
│  CUSTOMERS  │───┐
└─────────────┘   │
       │          │
       │ 1:N      │
       ▼          │
┌─────────────┐   │
│  VEHICLES   │   │
└─────────────┘   │
       │          │
       │          │
       │          │ 1:N
       │          │
       ▼          ▼
┌─────────────────────┐      ┌──────────────┐
│     BOOKINGS        │◄─────│  MECHANICS   │
└─────────────────────┘ N:1  └──────────────┘
       │    ▲
       │    │ N:1
       │    │
       │    └──────────────┐
       │                   │
       │              ┌──────────────────┐
       │              │  SERVICE_TYPES   │
       │              └──────────────────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│  INVOICES   │
└─────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│  INVOICE_ITEMS   │
└──────────────────┘

       BOOKINGS
          │
          │ 1:N
          ▼
      ┌──────────┐
      │ FEEDBACK │
      └──────────┘
```

---

## 📏 POSTER SIZES AND FORMAT

### Option 1: Three Separate Posters (A4 or A3)
1. **Poster 1** - Project Name + Team Information
2. **Poster 2** - Database ERD Diagram
3. **Poster 3** - Features and Technologies

### Option 2: One Large Combined Poster
Combine all information on one large poster

---

## 🎯 DESIGN RECOMMENDATIONS:

### Color Scheme:
- **Primary Color**: Blue (#2563EB) - technology, trust
- **Secondary**: Green (#10B981) - success, completion
- **Accent**: Orange (#F59E0B) - important elements
- **Background**: White/Light Gray (#F3F4F6)

### Poster Elements:
- System logo (can be created)
- Icons for each feature
- Colored blocks for different sections
- Arrows to show ERD relationships
- QR code for demo (optional)

---

## 📊 PROJECT STATISTICS:

- **Number of Tables**: 8
- **Number of Relationships**: 11
- **Number of Indexes**: 8
- **Backend Lines of Code**: ~3,000+
- **Frontend Lines of Code**: ~2,000+
- **API Endpoints**: 30+
- **Service Types**: 9
- **Ports Used**: 2 (5001 - Backend, 3001 - Frontend)

---

## 🚀 PROJECT HIGHLIGHTS:

1. ✅ **Complete Authentication & Authorization** with JWT tokens
2. ✅ **Secure Password Storage** with bcrypt hashing
3. ✅ **RESTful API Architecture**
4. ✅ **Responsive UI Design**
5. ✅ **Data Validation** at all levels
6. ✅ **Optimized Queries** with indexes
7. ✅ **Cascading Deletes** for data integrity
8. ✅ **Automatic Timestamp Updates**
9. ✅ **Rating & Review System**
10. ✅ **Multi-level Access Control**

---

## 📞 CONTACT INFORMATION:

**GitHub Repository**: booking-project  
**Database**: PostgreSQL 14  
**Deployment**: Local deployment

---

*Document created for Database Systems Project Exhibition*
*Date: December 2025*
