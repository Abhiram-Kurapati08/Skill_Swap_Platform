# Skill Swap Platform - Backend API

A comprehensive Node.js + Express backend for a Skill Swap Platform that allows users to exchange skills with each other.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Profiles**: Public/private profiles with skills offered and wanted
- **Skill Swap Requests**: Create, accept, reject, and manage swap requests
- **Rating System**: Rate and provide feedback after completed swaps
- **Admin Panel**: User management, moderation, and analytics
- **Activity Logging**: Comprehensive activity tracking for admin oversight
- **CSV Export**: Export user activity logs for analysis

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **json2csv** - CSV export functionality

## Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── swapController.js
│   ├── ratingController.js
│   └── adminController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── SwapRequest.js
│   ├── Rating.js
│   └── ActivityLog.js
├── routes/              # API routes
│   ├── auth.js
│   ├── users.js
│   ├── swaps.js
│   ├── ratings.js
│   └── admin.js
├── server.js            # Main server file
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Skill_Swap_Platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/skill-swap-platform

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # File Upload Configuration (for profile photos)
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/refresh` | Refresh JWT token | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users (public profiles) | Private |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| POST | `/api/users/skills/offered` | Add offered skill | Private |
| POST | `/api/users/skills/wanted` | Add wanted skill | Private |
| DELETE | `/api/users/skills/offered/:skillId` | Remove offered skill | Private |
| DELETE | `/api/users/skills/wanted/:skillId` | Remove wanted skill | Private |
| GET | `/api/users/stats` | Get user statistics | Private |

### Swap Requests

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/swaps` | Create swap request | Private |
| GET | `/api/swaps` | Get user's swap requests | Private |
| GET | `/api/swaps/:id` | Get swap request by ID | Private |
| PUT | `/api/swaps/:id/accept` | Accept swap request | Private |
| PUT | `/api/swaps/:id/reject` | Reject swap request | Private |
| PUT | `/api/swaps/:id/cancel` | Cancel swap request | Private |
| PUT | `/api/swaps/:id/complete` | Complete swap request | Private |

### Ratings

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/ratings` | Create rating | Private |
| GET | `/api/ratings/my-ratings` | Get user's own ratings | Private |
| GET | `/api/ratings/user/:userId` | Get ratings for a user | Private |
| GET | `/api/ratings/:id` | Get rating by ID | Private |
| PUT | `/api/ratings/:id` | Update rating | Private |
| DELETE | `/api/ratings/:id` | Delete rating | Private |

### Admin

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/dashboard` | Get dashboard statistics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| POST | `/api/admin/users/ban` | Ban user | Admin |
| POST | `/api/admin/users/unban` | Unban user | Admin |
| GET | `/api/admin/swaps` | Get all swap requests | Admin |
| GET | `/api/admin/activity-logs` | Get activity logs | Admin |
| GET | `/api/admin/export-logs` | Export logs to CSV | Admin |
| PUT | `/api/admin/moderate-skill` | Moderate skill | Admin |

## Data Models

### User
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  location: String (required),
  availability: String (enum: weekdays, weekends, evenings, flexible, not-available),
  skillsOffered: [{
    name: String,
    description: String,
    level: String (enum: beginner, intermediate, advanced, expert)
  }],
  skillsWanted: [{
    name: String,
    description: String,
    level: String
  }],
  profilePhotoUrl: String,
  isProfilePublic: Boolean (default: true),
  role: String (enum: user, admin, default: user),
  isBanned: Boolean (default: false),
  banReason: String,
  averageRating: Number (default: 0),
  totalRatings: Number (default: 0),
  completedSwaps: Number (default: 0)
}
```

### SwapRequest
```javascript
{
  requester: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  requestedSkill: {
    name: String,
    description: String,
    level: String
  },
  offeredSkill: {
    name: String,
    description: String,
    level: String
  },
  status: String (enum: pending, accepted, rejected, cancelled, completed),
  message: String,
  scheduledDate: Date,
  completedDate: Date,
  isRated: Boolean (default: false)
}
```

### Rating
```javascript
{
  swapRequest: ObjectId (ref: SwapRequest),
  rater: ObjectId (ref: User),
  ratedUser: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  skillRated: {
    name: String,
    level: String
  }
}
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe",
    "location": "New York",
    "availability": "flexible"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Create a swap request
```bash
curl -X POST http://localhost:5000/api/swaps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipientId": "user_id_here",
    "requestedSkill": {
      "name": "JavaScript",
      "description": "Help me learn JavaScript fundamentals",
      "level": "beginner"
    },
    "offeredSkill": {
      "name": "Python",
      "description": "I can teach you Python programming",
      "level": "intermediate"
    },
    "message": "Would you like to swap JavaScript lessons for Python?"
  }'
```

### Add a skill to profile
```bash
curl -X POST http://localhost:5000/api/users/skills/offered \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Web Development",
    "description": "Full-stack web development with React and Node.js",
    "level": "advanced"
  }'
```

## Error Handling

The API uses consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## Validation

The API includes comprehensive input validation using express-validator:

- Email format validation
- Password strength requirements
- Required field validation
- Data type validation
- Custom business logic validation

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- Activity logging for audit trails

## Admin Features

- User management (view, ban, unban)
- Skill moderation
- Activity monitoring
- Analytics dashboard
- CSV export functionality
- Comprehensive logging

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests (when implemented)
```bash
npm test
```

### Code Linting (when implemented)
```bash
npm run lint
```

## Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Use a process manager like PM2
6. Set up reverse proxy (nginx)
7. Configure SSL/TLS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 