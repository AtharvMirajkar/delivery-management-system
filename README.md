# Delivery Management System

A comprehensive delivery management application with separate admin and delivery partner interfaces, built with Next.js and Express.js in a monorepo structure.

## Features

### Admin Interface
- Create and manage delivery orders
- View all orders with real-time status updates
- Assign orders to available delivery partners
- Track delivery partner availability
- Delete orders
- View comprehensive statistics dashboard

### Partner Interface
- View assigned deliveries
- Update availability status
- Interactive map visualization of delivery locations
- Update order status (picked up, delivered)
- View pickup and delivery addresses with customer details

## Tech Stack

### Frontend
- Next.js 13.5
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Leaflet (for maps)
- Context API for authentication

### Backend
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator

## Project Structure

```
.
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── partner/      # Partner dashboard
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── components/       # React components
│   │   ├── admin/        # Admin-specific components
│   │   ├── partner/      # Partner-specific components
│   │   └── ui/           # Shadcn UI components
│   └── lib/              # Utilities and API client
│
└── backend/              # Express.js API
    ├── src/
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Auth middleware
    │   └── config/       # Database configuration
    └── package.json

```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### Configuration

1. Backend Environment Variables:
Create `backend/.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/delivery-management
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

2. Frontend Environment Variables:
Create `frontend/.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

Backend:
```bash
npm run dev:backend
```

Frontend:
```bash
npm run dev:frontend
```

#### Production Build

Build both applications:
```bash
npm run build
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## User Roles

### Admin
- Create delivery orders with pickup and delivery locations
- Assign orders to available delivery partners
- View all orders and their statuses
- Manage delivery partners
- Delete orders

### Delivery Partner
- View assigned deliveries
- See deliveries on an interactive map
- Update order status (picked up, delivered)
- Toggle availability status
- View customer details and delivery addresses

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Orders
- GET `/api/orders` - Get orders (filtered by role)
- POST `/api/orders` - Create new order (admin only)
- GET `/api/orders/:id` - Get specific order
- PUT `/api/orders/:id/assign` - Assign order to partner (admin only)
- PUT `/api/orders/:id/status` - Update order status
- DELETE `/api/orders/:id` - Delete order (admin only)

### Partners
- GET `/api/partners` - Get all partners
- GET `/api/partners/available` - Get available partners
- PUT `/api/partners/availability` - Update partner availability

## Default Test Users

After setup, register users with different roles:

Admin user:
- Email: admin@example.com
- Password: admin123
- Role: Admin

Partner user:
- Email: partner@example.com
- Password: partner123
- Role: Partner

## Map Integration

The partner dashboard includes an interactive map powered by Leaflet and OpenStreetMap:
- Pickup locations marked with pins
- Delivery locations marked with pins
- Routes shown as dashed lines between pickup and delivery
- Popup information for each location

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Role-based access control
- Input validation with express-validator

## Development Notes

- Frontend runs on port 3000
- Backend runs on port 5000
- MongoDB should be running on default port 27017
- CORS is enabled for cross-origin requests
- Session tokens expire after 7 days

## License

This project is for assignment and evaluation purposes.
