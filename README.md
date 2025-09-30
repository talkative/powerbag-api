# Powerbag API

A RESTful API built with Node.js, Express, TypeScript, and MongoDB for managing storylines, events, info content, collections, assets, and users in the Powerbag application.

## Features

- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: User roles with member/admin permissions
- **Email Integration**: Mandrill email service integration
- **Asset Management**: Complete file upload system with S3 integration for images, videos, and audio
- **Modular Architecture**: Clean separation of concerns with handlers, routes, and models
- **HTTP Status Constants**: Centralized HTTP status code management
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Structured error responses and graceful shutdown
- **Environment Configuration**: Flexible configuration management
- **Preview/Published Workflow**: Dual-state content management system
- **Collection System**: Organize storylines into collections with unidirectional relationships

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **File Storage**: AWS S3 for asset storage
- **File Upload**: Multer for multipart form handling
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: Bcrypt for password hashing
- **Email Service**: Nodemailer with Mandrill transport
- **Environment**: dotenv for configuration

## Project Structure

```
src/
├── index.ts                          # Application entry point
├── config/
│   └── database.ts                   # MongoDB connection configuration
├── constants/
│   └── httpStatusCodes.ts           # HTTP status code constants
├── dtos/
│   ├── CreateAsset.dto.ts           # Asset data transfer objects
│   └── CreateUser.dto.ts            # User data transfer objects
├── handlers/
│   ├── assets.ts                    # Asset upload and management handlers
│   ├── collections.ts               # Collection handlers/controllers
│   ├── events.ts                    # Event handlers/controllers
│   ├── info.ts                      # Info content handlers
│   ├── storyline.ts                 # Storyline handlers
│   └── users.ts                     # User handlers with auth
├── middleware/
│   └── auth.ts                      # JWT authentication middleware
├── models/
│   ├── Collection.ts                # Collection model for organizing storylines
│   ├── Events.ts                    # Event data model and schema
│   ├── Info.ts                      # Info content model
│   ├── Storyline.ts                 # Storyline model with embedded bags
│   ├── User.ts                      # User model with roles and authentication
│   └── Asset/
│       ├── BaseAsset.ts             # Base asset model with common properties
│       ├── ImageAsset.ts            # Image-specific asset model
│       ├── VideoAsset.ts            # Video-specific asset model
│       ├── AudioAsset.ts            # Audio-specific asset model
│       └── index.ts                 # Asset model exports
├── routes/
│   ├── assets.ts                    # Asset API endpoints
│   ├── collection.ts                # Collection API endpoints
│   ├── events.ts                    # Event API endpoints
│   ├── info.ts                      # Info content endpoints
│   ├── storyline.ts                 # Storyline API endpoints
│   └── users.ts                     # User API endpoints with auth
├── types/
│   ├── nodemailer-mandrill-transport.d.ts  # Type declarations for email
│   ├── query-params.ts              # Query parameter interfaces
│   └── response.ts                  # Response type definitions
└── utils/
    ├── jwt.ts                       # JWT token utilities
    ├── mandrill.ts                  # Email service utilities
    └── s3.ts                        # S3 file storage utilities
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- AWS S3 bucket and credentials
- npm or yarn package manager
- Mandrill API key (for email functionality)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd powerbag-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
MANDRILL_KEY=your_mandrill_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

### Production

Build and start the production server:

```bash
npm run build
npm start
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require a valid Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **member**: Default role for new users
- **admin**: Administrative privileges

## Content Management System

The API features a **preview/published workflow** for content management:

- **Preview**: Draft content for editing and testing
- **Published**: Live content served to end users
- **Publishing**: Simple copy operation from preview to published state
- **Independent Publishing**: Each content type can be published separately

## API Endpoints

### Users (`/api/users`)

User account management and authentication:

| Method   | Endpoint                    | Auth Required | Description                      |
| -------- | --------------------------- | ------------- | -------------------------------- |
| `GET`    | `/users`                    | Yes           | Get all users                    |
| `GET`    | `/users/:id`                | Yes           | Get user by ID                   |
| `POST`   | `/users`                    | No            | Create new user                  |
| `POST`   | `/users/login`              | No            | Login user and get token         |
| `PUT`    | `/users/:id`                | Yes           | Update user details              |
| `DELETE` | `/users/:id`                | Yes           | Delete user                      |
| `GET`    | `/users/check-email/:email` | No            | Check if email exists            |
| `POST`   | `/users/send-totp`          | No            | Send TOTP email for verification |

### Storylines (`/api/storylines`)

Complete storyline management with preview/published workflow:

| Method   | Endpoint                     | Auth Required | Description                                  |
| -------- | ---------------------------- | ------------- | -------------------------------------------- |
| `GET`    | `/storylines`                | No            | Get all storylines with optional filtering   |
| `GET`    | `/storylines/:id`            | No            | Get specific storyline by id                 |
| `POST`   | `/storylines`                | Yes           | Create new storyline (requires collectionId) |
| `PUT`    | `/storylines/:id`            | Yes           | Update existing storyline                    |
| `DELETE` | `/storylines/:id`            | Yes           | Delete specific storyline by ID              |
| `DELETE` | `/storylines`                | Yes           | Delete all storylines                        |
| `GET`    | `/storylines/system/updates` | No            | Check if updates are available               |
| `POST`   | `/storylines/:title/publish` | Yes           | Publish specific storyline                   |
| `POST`   | `/storylines/publish/all`    | Yes           | Publish all storylines                       |

**Query Parameters:**

- `status` - Filter by status (`preview` or `published`)
- `titles` - Filter by specific titles (array or single value)

### Collections (`/api/collections`)

Collection management for organizing storylines:

| Method   | Endpoint                                             | Auth Required | Description                      |
| -------- | ---------------------------------------------------- | ------------- | -------------------------------- |
| `GET`    | `/collections`                                       | No            | Get all collections              |
| `GET`    | `/collections/:id`                                   | No            | Get specific collection by ID    |
| `POST`   | `/collections`                                       | Yes           | Create new collection            |
| `PUT`    | `/collections/:id`                                   | Yes           | Update existing collection       |
| `DELETE` | `/collections/:id`                                   | Yes           | Delete collection                |
| `POST`   | `/collections/:collectionId/storylines/:storylineId` | Yes           | Add storyline to collection      |
| `DELETE` | `/collections/:collectionId/storylines/:storylineId` | Yes           | Remove storyline from collection |
| `POST`   | `/collections/:id/publish`                           | Yes           | Publish specific collection      |
| `POST`   | `/collections/publish/all`                           | Yes           | Publish all collections          |

**Query Parameters:**

- `status` - Filter by status (`preview` or `published`)
- `includeStorylines` - Include storylines in collection response (`true` or `false`)

### Assets (`/api/assets`)

Complete asset management system with S3 integration:

| Method   | Endpoint                        | Auth Required | Description                          |
| -------- | ------------------------------- | ------------- | ------------------------------------ |
| `POST`   | `/assets/image/upload`          | Yes           | Upload single image                  |
| `POST`   | `/assets/video/upload`          | Yes           | Upload single video                  |
| `POST`   | `/assets/audio/upload`          | Yes           | Upload single audio file             |
| `POST`   | `/assets/image/upload/multiple` | Yes           | Upload multiple images (max 10)      |
| `POST`   | `/assets/video/upload/multiple` | Yes           | Upload multiple videos (max 5)       |
| `POST`   | `/assets/audio/upload/multiple` | Yes           | Upload multiple audio files (max 10) |
| `GET`    | `/assets/:type`                 | No            | Get assets by type with filtering    |
| `GET`    | `/assets/detail/:id`            | No            | Get specific asset by ID             |
| `DELETE` | `/assets/:id`                   | Yes           | Delete asset (S3 and database)       |

**Supported File Types:**

- **Images**: JPEG, JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, AVI, QuickTime, WMV, FLV, WebM
- **Audio**: MP3, WAV, FLAC, AAC, OGG

**Query Parameters for GET `/assets/:type`:**

- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 100, max: 100)
- `tags` - Filter by tags (array or single value)
- `isPublic` - Filter by public status (`true` or `false`)
- `uploadedBy` - Filter by user ID who uploaded the asset

### Events (`/api/events`)

Event tracking and management:

| Method   | Endpoint      | Auth Required | Description                              |
| -------- | ------------- | ------------- | ---------------------------------------- |
| `GET`    | `/events`     | No            | Get all events (sorted by creation date) |
| `POST`   | `/events`     | Yes           | Create new events collection             |
| `DELETE` | `/events/:id` | Yes           | Delete specific event by ID              |

### Info Content (`/api/info`)

Multi-language information content management:

| Method | Endpoint    | Auth Required | Description                  |
| ------ | ----------- | ------------- | ---------------------------- |
| `GET`  | `/info`     | No            | Get info content             |
| `POST` | `/info`     | Yes           | Create new info content      |
| `PUT`  | `/info/:id` | Yes           | Update existing info content |

## Data Models

### User

- `name` (string): User's full name (optional, max 50 characters)
- `email` (string, required, unique): User's email address with validation
- `roles` (array): User roles (`['member']` by default, can include `'admin'`)
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Storyline

- `title` (string, required): Storyline title
- `status` (enum): `'preview'` or `'published'`
- `bags` (object): Three columns of embedded bag objects with images/videos
- `stories` (array): Story events with audio, timing, and bag selections
- `collections` (array): References to collections this storyline belongs to
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Collection

- `name` (string, required, unique): Collection name
- `description` (string): Optional collection description
- `status` (enum): `'preview'` or `'published'`
- `createDate` / `updateDate` (Date): Auto-generated timestamps

**Note**: Collections use a unidirectional relationship - storylines reference collections, not vice versa.

### Events

- `data` (array): Collection of event objects with timing and metadata
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Info

- `en` (string, required): English content
- `nl` (string, required): Dutch content
- `createDate` / `updateDate` (Date): Auto-generated timestamps

## Data Relationships

### Storyline ↔ Collection Relationship

- **Type**: Many-to-Many (unidirectional)
- **Implementation**: Storylines store collection IDs in `collections` array
- **Benefits**: Simple relationship management, no data synchronization issues

## Example Requests

### User Registration

```bash
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### User Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Create Storyline (Authenticated)

```bash
POST /api/storylines
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "Adventure Story",
  "bags": {
    "firstColumn": [
      {
        "id": "bag-001",
        "imageUrl": "https://example.com/bag1.jpg",
        "videoUrl": "https://example.com/bag1.mp4",
        "imageFrameUrls": ["https://example.com/frame1.jpg"]
      }
    ],
    "secondColumn": [...],
    "thirdColumn": [...]
  },
  "stories": [
    {
      "id": "story-1",
      "audioSrc": "https://example.com/audio.mp3",
      "selectedBags": ["bag-001"],
      "events": [...]
    }
  ]
}
```

### Create Collection and Add Storyline

```bash
# Create collection
POST /api/collections
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Adventure Collection",
  "description": "Epic adventure storylines"
}

# Add storyline to collection
POST /api/collections/{collection_id}/storylines/{storyline_id}
Authorization: Bearer <your_jwt_token>
```

### Publishing Workflow

```bash
# Publish individual items
POST /api/storylines/adventure-story/publish
POST /api/collections/collection-id/publish

# Publish all at once
POST /api/storylines/publish/all
POST /api/collections/publish/all
```

## HTTP Status Codes

The API uses centralized HTTP status constants for consistency:

```typescript
import { HTTP_STATUS } from './constants/httpStatusCodes';

// Examples:
HTTP_STATUS.OK; // 200
HTTP_STATUS.CREATED; // 201
HTTP_STATUS.BAD_REQUEST; // 400
HTTP_STATUS.UNAUTHORIZED; // 401
HTTP_STATUS.FORBIDDEN; // 403
HTTP_STATUS.NOT_FOUND; // 404
HTTP_STATUS.INTERNAL_SERVER_ERROR; // 500
HTTP_STATUS.NOT_IMPLEMENTED; // 501
```

## Error Handling

The API returns structured error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `501` - Not Implemented

## Environment Variables

| Variable                | Description                  | Default                              | Required |
| ----------------------- | ---------------------------- | ------------------------------------ | -------- |
| `MONGODB_URI`           | MongoDB connection string    | `mongodb://localhost:27017/powerbag` | Yes      |
| `PORT`                  | Server port                  | `3000`                               | No       |
| `NODE_ENV`              | Environment mode             | `development`                        | No       |
| `JWT_SECRET`            | Secret key for JWT tokens    | -                                    | Yes      |
| `MANDRILL_KEY`          | Mandrill API key for emails  | -                                    | Yes      |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID for S3     | -                                    | Yes      |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key for S3 | -                                    | Yes      |
| `AWS_REGION`            | AWS region for S3            | -                                    | Yes      |
| `AWS_S3_BUCKET`         | AWS S3 bucket name           | -                                    | Yes      |

## Email Integration

The API includes email functionality using Mandrill:

- **Service**: Nodemailer with Mandrill transport
- **Templates**: Support for merge variables and templates
- **Configuration**: Environment-based API key configuration

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User roles for authorization control
- **Password Security**: Bcrypt hashing (Note: Currently email-only auth)
- **Email Validation**: Comprehensive email format validation and uniqueness
- **Input Sanitization**: Mongoose schema validation
- **MongoDB Protection**: Injection protection via Mongoose ODM
- **Environment Security**: Sensitive data in environment variables

## Authentication Middleware

Protected routes use JWT middleware that:

1. **Validates Bearer Token**: Checks Authorization header format
2. **Verifies JWT**: Validates token signature and expiration
3. **User Lookup**: Fetches user from database
4. **Role Attachment**: Attaches user data to request object

## Publishing Workflow

The content management system supports a comprehensive preview/published workflow:

### Content States

- **Preview**: Draft content for editing and testing
- **Published**: Live content served to end users

### Publishing Process

1. **Create/Edit in Preview**: All content starts as preview
2. **Test and Validate**: Use preview endpoints for testing
3. **Publish**: Copy preview content to published state
4. **Go Live**: Published content is served to end users

### Independent Publishing

- **Storylines**: Publish storylines (which reference bags)
- **Collections**: Publish collections (which reference storylines)
- **Batch Operations**: Publish all content of a type at once

## Development Scripts

- `npm run dev` - Start development server with nodemon and ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server from compiled JavaScript
- `npm test` - Run tests (to be implemented)

## TypeScript Configuration

The project uses strict TypeScript settings with comprehensive type safety:

- **Module System**: Node.js ESNext modules
- **Strict Mode**: Enabled for maximum type safety
- **Output**: Compiled to `dist/` directory
- **Source Maps**: Generated for debugging
- **Custom Declarations**: Type definitions for external modules

## Architecture Patterns

### Request Flow

1. **Routes** ([`src/routes/`](src/routes/)) - Define API endpoints and middleware
2. **Middleware** ([`src/middleware/`](src/middleware/)) - Authentication and validation
3. **Handlers** ([`src/handlers/`](src/handlers/)) - Process business logic
4. **Models** ([`src/models/`](src/models/)) - Database operations with Mongoose
5. **Response** - Structured JSON responses with consistent status codes

### Data Architecture

- **Embedded Design**: Bags are embedded within storylines as structured objects
- **Unidirectional Relationships**: Storylines reference collections (not bidirectional)
- **Status Management**: Each content type has independent preview/published states
- **Reference Integrity**: Automatic cleanup when collections are deleted

### Type Safety

- **DTOs** ([`src/dtos/`](src/dtos/)) - Request/response data structures
- **Interfaces** ([`src/types/`](src/types/)) - Shared type definitions
- **Models** - Mongoose schemas with TypeScript interfaces
- **Constants** - Centralized HTTP status codes and other constants

## Performance Considerations

- **Efficient Queries**: Compound indexes for status + identifier lookups
- **Embedded Objects**: Bags stored within storylines for fast access
- **Reference Optimization**: Store collection IDs for flexible relationships
- **Batch Operations**: Support for publishing multiple items at once

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
