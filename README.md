# BBO Token System

A Next.js-based token management system with user authentication, token generation, validation, and version checking capabilities.

## Features

- ✅ User management (create users)
- ✅ Token generation with optional expiration dates
- ✅ Token validation with device tracking
- ✅ Version update checking
- ✅ PostgreSQL database integration with Prisma
- ✅ Standardized API response format

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BBO-Token-sys
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database?sslmode=require"
VERSION="2.0.0"
```

4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

All endpoints return responses in a standardized format:
```json
{
  "valid": true/false,
  "message": "string",
  "code": "string",
  "data": { ... }  // Only for success responses
}
```

### 1. Create User

**Endpoint:** `POST /api/user/create`

**Request Body:**
```json
{
  "username": "string"
}
```

**Success Response (201):**
```json
{
  "valid": true,
  "message": "user created successfully",
  "code": "201",
  "data": {
    "id": 1,
    "username": "testuser",
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing username
- `409`: Username already exists
- `500`: Internal server error

### 2. Generate Token

**Endpoint:** `POST /api/token/generate`

**Request Body:**
```json
{
  "username": "string",
  "custom_token": "string (optional)",
  "expirate_date": "dd-mm-yyyy or 'never' (optional)"
}
```

**Success Response (201):**
```json
{
  "valid": true,
  "message": "token generated successfully",
  "code": "201",
  "data": {
    "token": "uuid-or-custom-token",
    "expiresAt": "2025-12-25T00:00:00.000Z" // or null
  }
}
```

**Error Responses:**
- `400`: Missing username, invalid date format, or custom token already exists
- `404`: User not found
- `500`: Internal server error

### 3. Validate Token

**Endpoint:** `GET /api/token/validate`

**Query Parameters:**
- `token` (required): The token to validate
- `deviceId` (optional): Device identifier for device tracking

**Success Response (200):**
```json
{
  "valid": true,
  "message": "token is valid",
  "code": "200",
  "data": {
    "token": "token-value",
    "userId": 1,
    "expiresAt": "2025-12-25T00:00:00.000Z" // or null
  }
}
```

**Error Responses:**
- `200`: Token not found, expired, or device mismatch (with `valid: false`)
- `400`: Missing token parameter
- `409`: Token already used on different device
- `500`: Internal server error

**Special Behaviors:**
- First validation with `deviceId` sets the device for that token
- Subsequent validations with the same `deviceId` update `lastUsed` timestamp
- Different `deviceId` returns conflict error (409)
- Expired tokens return `valid: false` with code `401`

### 4. Check Update

**Endpoint:** `GET /api/isUpdate`

**Query Parameters:**
- `Version` (required): Client application version

**Success Response (200) - Up to date:**
```json
{
  "valid": true,
  "message": "version is up to date",
  "code": "200",
  "data": {
    "currentVersion": "2.0.0",
    "clientVersion": "2.0.0"
  }
}
```

**Response (200) - Update Required:**
```json
{
  "valid": false,
  "message": "update required",
  "code": "426",
  "data": {
    "currentVersion": "2.0.0",
    "clientVersion": "1.0.0"
  }
}
```

**Error Responses:**
- `400`: Missing Version parameter
- `500`: Internal server error

**Note:** The current version is read from the `VERSION` or `APP_VERSION` environment variable. Defaults to `2.0.0` if not set.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `VERSION` | Application version for update checks | No | `2.0.0` |
| `APP_VERSION` | Alternative name for VERSION | No | - |

## Database Schema

### User
- `id`: Integer (Primary Key)
- `name`: String (username)
- `createdAt`: DateTime

### Token
- `id`: Integer (Primary Key)
- `value`: String (Unique, token value)
- `userId`: Integer (Foreign Key to User)
- `deviceId`: String (Optional, device identifier)
- `createdAt`: DateTime
- `expiresAt`: DateTime (Optional, expiration date)
- `lastUsed`: DateTime (Optional, last validation timestamp)

## Project Structure

```
BBO-Token-sys/
├── app/
│   ├── api/
│   │   ├── user/
│   │   │   └── create/
│   │   │       └── route.ts
│   │   ├── token/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   └── isUpdate/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   └── getBody.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `VERSION`: Your application version (e.g., `2.0.0`)
4. Deploy!

## API Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success / OK |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized (expired token) |
| `404` | Not Found |
| `409` | Conflict (username exists, device mismatch) |
| `426` | Upgrade Required (version mismatch) |
| `500` | Internal Server Error |

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
