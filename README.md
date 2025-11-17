# Powerbag API

A RESTful API built with Node.js, Express, TypeScript, and MongoDB for managing storylines, events, info content, collections, assets, and users in the Powerbag application.

## Features

- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Multi-tier user roles (member/admin/superadmin) with collection-based access
- **Email Integration**: Mandrill email service integration
- **Asset Management**: Complete file upload system with S3 integration, duplicate detection, and automatic location tracking
- **Settings System**: Centralized configuration management with public/private settings and categorization
- **Modular Architecture**: Clean separation of concerns with handlers, routes, and models
- **HTTP Status Constants**: Centralized HTTP status code management
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Structured error responses and graceful shutdown
- **Environment Configuration**: Flexible configuration management
- **Preview/Published Workflow**: Unified content management with automatic publishing and version comparison
- **Collection System**: Organize storylines into collections with content activity tracking
- **Migration Support**: Built-in data migration and location resolution tools

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
│   ├── CreateStoryline.dto.ts       # Storyline data transfer objects
│   └── CreateUser.dto.ts            # User data transfer objects
├── handlers/
│   ├── assets.ts                    # Asset upload and management with duplicate detection
│   ├── collections.ts               # Collection handlers with version comparison
│   ├── events.ts                    # Event handlers/controllers
│   ├── info.ts                      # Info content handlers
│   ├── settings.ts                  # Settings management handlers
│   ├── storyline.ts                 # Storyline handlers with unified workflow
│   └── users.ts                     # User handlers with role-based access control
├── middleware/
│   └── auth.ts                      # JWT authentication middleware
├── models/
│   ├── Collection.ts                # Collection model with publishing workflow
│   ├── Events.ts                    # Event data model and schema
│   ├── Info.ts                      # Info content model
│   ├── Settings.ts                  # Centralized settings model with categories
│   ├── Storyline.ts                 # Unified storyline model with asset references
│   ├── User.ts                      # User model with collection access control
│   └── Asset/
│       ├── BaseAsset.ts             # Base asset model with location tracking
│       ├── ImageAsset.ts            # Image-specific asset model
│       ├── VideoAsset.ts            # Video-specific asset model
│       ├── AudioAsset.ts            # Audio-specific asset model
│       └── index.ts                 # Asset model exports
├── routes/
│   ├── assets.ts                    # Asset API endpoints
│   ├── collection.ts                # Collection API endpoints with comparison
│   ├── events.ts                    # Event API endpoints
│   ├── info.ts                      # Info content endpoints
│   ├── settings.ts                  # Settings management endpoints
│   ├── storyline.ts                 # Storyline API endpoints with migration
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

- **member**: Default role with access to assigned collections
- **admin**: Administrative privileges with full system access
- **superadmin**: Highest level administrative privileges with unrestricted access

### Collection Access Control

- **Members**: Can only access collections assigned to them via `assignedCollectionIds`
- **Admins**: Have access to all collections regardless of assignment
- **Superadmins**: Have unrestricted access to all collections and system-wide privileges
- **Dynamic Access**: User access is validated on each request using collection-specific methods

## Content Management System

The API features a **unified preview/published workflow** for content management:

- **Preview**: Draft content for editing and testing
- **Published**: Live content served to end users
- **Unified Publishing**: Collections and storylines published together automatically
- **Version Comparison**: Compare preview vs published versions to determine if publishing is needed
- **Activity Tracking**: Track content updates and last modified dates
- **Settings Management**: Centralized configuration system with categorization

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

Complete storyline management with unified preview/published workflow:

| Method   | Endpoint                        | Auth Required | Description                                  |
| -------- | ------------------------------- | ------------- | -------------------------------------------- |
| `GET`    | `/storylines`                   | No            | Get all storylines with optional filtering   |
| `GET`    | `/storylines/:id`               | No            | Get specific storyline by id                 |
| `POST`   | `/storylines`                   | Yes           | Create new storyline (requires collectionId) |
| `PUT`    | `/storylines/:id`               | Yes           | Update existing storyline                    |
| `DELETE` | `/storylines/:id`               | Yes           | Delete specific storyline by ID              |
| `POST`   | `/storylines/resolve-locations` | Yes           | Resolve location information for storylines  |
| `POST`   | `/storylines/migrate/:id`       | Yes           | Migrate storyline to new format              |
| `GET`    | `/storylines/system/updates`    | No            | Check if updates are available               |

**Query Parameters:**

- `status` - Filter by status (`preview` or `published`)
- `titles` - Filter by specific titles (array or single value)

### Collections (`/api/collections`)

Collection management for organizing storylines with version comparison:

| Method   | Endpoint                                             | Auth Required | Description                           |
| -------- | ---------------------------------------------------- | ------------- | ------------------------------------- |
| `GET`    | `/collections`                                       | No            | Get all collections                   |
| `GET`    | `/collections/:id`                                   | No            | Get specific collection by ID         |
| `POST`   | `/collections`                                       | Yes           | Create new collection                 |
| `PUT`    | `/collections/:id`                                   | Yes           | Update existing collection            |
| `DELETE` | `/collections/:id`                                   | Yes           | Delete collection                     |
| `POST`   | `/collections/:collectionId/storylines/:storylineId` | Yes           | Add storyline to collection           |
| `DELETE` | `/collections/:collectionId/storylines/:storylineId` | Yes           | Remove storyline from collection      |
| `POST`   | `/collections/:id/publish`                           | Yes           | Publish collection and storylines     |
| `POST`   | `/collections/publish/all`                           | Yes           | Publish all collections               |
| `POST`   | `/collections/:id/duplicate`                         | Yes           | Duplicate collection with auto-naming |
| `GET`    | `/collections/:id/compare`                           | Yes           | Compare preview vs published versions |
| `GET`    | `/collections/:id/publish-status`                    | Yes           | Check if collection needs publishing  |

**Query Parameters:**

- `status` - Filter by status (`preview` or `published`)
- `includeStorylines` - Include storylines in collection response (`true` or `false`)
- `includeLastUpdatedContent` - Include latest storyline update timestamp (`true` or `false`)

### Assets (`/api/assets`)

Complete asset management system with S3 integration and duplicate detection:

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
| `PATCH`  | `/assets/:type/:id`             | Yes           | Update specific asset fields         |
| `PATCH`  | `/assets`                       | Yes           | Bulk update multiple assets          |
| `GET`    | `/assets/migrate/preview`       | Yes (Admin)   | Preview asset field migration        |
| `POST`   | `/assets/migrate`               | Yes (Admin)   | Run asset field migration            |
| `DELETE` | `/assets/:id`                   | Yes           | Delete asset (S3 and database)       |

**Enhanced Features:**

- **Duplicate Detection**: Automatic detection and prevention of duplicate uploads
- **Filename Sanitization**: Automatic sanitization of special characters in filenames
- **Location Tracking**: Automatic tracking of asset usage in storylines and collections
- **Partial Updates**: Update specific asset fields without replacing entire asset
- **Bulk Operations**: Update multiple assets in a single request
- **Migration Tools**: Built-in migration system for updating asset field structure

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

### Settings (`/api/settings`)

Centralized settings management with categorization:

| Method   | Endpoint                       | Auth Required | Description              |
| -------- | ------------------------------ | ------------- | ------------------------ |
| `GET`    | `/settings`                    | Yes (Admin)   | Get all settings         |
| `GET`    | `/settings/public`             | No            | Get public settings      |
| `GET`    | `/settings/category/:category` | Yes           | Get settings by category |
| `POST`   | `/settings`                    | Yes (Admin)   | Create or update setting |
| `PUT`    | `/settings/:id`                | Yes (Admin)   | Update specific setting  |
| `DELETE` | `/settings/:id`                | Yes (Admin)   | Delete setting           |

**Settings Features:**

- **Categorization**: Organize settings by category (website, email, etc.)
- **Public/Private**: Control which settings are accessible to frontend
- **Type Safety**: Strongly typed values (string, number, boolean, object, array, objectId)
- **Default Values**: Automatic initialization of default system settings

## Data Models

### User

- `name` (string): User's full name (optional, max 50 characters)
- `email` (string, required, unique): User's email address with validation
- `roles` (array): User roles (`['member']` by default, can include `'admin'` and `'superadmin'`)
- `assignedCollectionIds` (array): Collection IDs the user has access to (for members)
- `createDate` / `updateDate` (Date): Auto-generated timestamps

**Access Control Methods:**

- `hasAccessToCollection(collectionId)`: Check if user can access specific collection
- `getAccessibleCollectionIds()`: Get list of collections user can access

### Storyline

- `title` (string, required): Storyline title
- `subtitle` (string): Optional storyline subtitle
- `description` (string): Optional storyline description
- `status` (enum): `'preview'` or `'published'`
- `bags` (object): Three columns of bag objects with asset references
- `stories` (array): Story events with audio, timing, and asset references
- `collections` (array): References to collections this storyline belongs to
- `previewVersionId` (ObjectId): Reference to preview version (for published storylines)
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Collection

- `name` (string, required): Collection name (auto-incremented for duplicates)
- `description` (string): Optional collection description
- `status` (enum): `'preview'` or `'published'`
- `previewVersionId` (ObjectId): Reference to preview version (for published collections)
- `publishedDate` (Date): When the preview collection was last published
- `createDate` / `updateDate` (Date): Auto-generated timestamps

**Duplication Features:**

- Automatic name incrementing: "Collection" → "Collection (1)" → "Collection (2)"
- Optional storyline duplication with preserved titles

### Settings

- `key` (string, required, unique): Setting identifier
- `value` (any, required): Setting value (typed based on type field)
- `type` (enum): `'string' | 'number' | 'boolean' | 'object' | 'array' | 'objectId'`
- `description` (string): Optional description of the setting
- `category` (string): Category for grouping (default: 'general')
- `isPublic` (boolean): Whether setting is accessible to frontend (default: false)
- `createDate` / `updateDate` (Date): Auto-generated timestamps

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

### User ↔ Collection Access Control

- **Type**: Many-to-Many via `assignedCollectionIds`
- **Admin Access**: Admins have access to all collections
- **Member Access**: Members only access assigned collections
- **Dynamic Validation**: Access checked on each request

### Asset Location Tracking

- **Automatic Tracking**: Assets track their usage in storylines via `location` field
- **Format**: `{collectionIds}:{storylineId}` for easy parsing
- **Updates**: Location updated automatically when storylines change collections

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

# Check if collection needs publishing
GET /api/collections/{collection_id}/publish-status

# Compare preview vs published versions
GET /api/collections/{collection_id}/compare

# Duplicate collection with storylines
POST /api/collections/{collection_id}/duplicate?includeStorylines=true
```

### Asset Management

```bash
# Update asset fields
PATCH /api/assets/image/64f123...
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "filename": "updated_beach_photo.jpg",
  "altText": "Beautiful sunset at the beach",
  "description": "Updated description for the photo"
}

# Bulk update multiple assets
PATCH /api/assets
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "updates": [
    {
      "id": "64f123...",
      "type": "image",
      "filename": "new_image_name.jpg",
      "altText": "Updated alt text"
    },
    {
      "id": "64f456...",
      "type": "video",
      "description": "Updated video description",
      "duration": 1500
    }
  ]
}

# Preview asset migration
GET /api/assets/migrate/preview
Authorization: Bearer <admin_jwt_token>

# Run asset migration
POST /api/assets/migrate
Authorization: Bearer <admin_jwt_token>
```

### Publishing Workflow

```bash
# Check if collection needs publishing
GET /api/collections/{collection_id}/publish-status

# Compare versions before publishing
GET /api/collections/{collection_id}/compare

# Publish collection and all its storylines
POST /api/collections/{collection_id}/publish

# Publish all collections
POST /api/collections/publish/all
```

### Settings Management

```bash
# Get public settings (for frontend)
GET /api/settings/public

# Get all settings (admin only)
GET /api/settings
Authorization: Bearer <admin_jwt_token>

# Create/update setting
POST /api/settings
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "key": "defaultCollection",
  "value": "64f123...",
  "type": "objectId",
  "description": "Default collection for the website",
  "category": "website",
  "isPublic": true
}
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

The content management system supports a comprehensive unified preview/published workflow:

### Content States

- **Preview**: Draft content for editing and testing
- **Published**: Live content served to end users

### Unified Publishing Process

1. **Create/Edit in Preview**: All content starts as preview
2. **Test and Validate**: Use preview endpoints for testing
3. **Compare Versions**: Check what has changed since last publish
4. **Publish Collection**: Automatically publishes collection and all storylines together
5. **Track Publishing**: Preview collections marked with `publishedDate`

### Version Comparison Features

- **Detailed Comparison**: See exactly what has changed between versions
- **Publishing Recommendations**: Automatic detection of whether publishing is needed
- **Content Activity**: Track when storylines within collections were last modified

### Publishing Benefits

- **Unified Workflow**: Collections and storylines published together for consistency
- **Version Control**: Clear tracking of preview vs published content
- **Activity Tracking**: Easy identification of collections needing attention

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

- **Unified Design**: Preview and published content use same structure with asset references
- **Unidirectional Relationships**: Storylines reference collections (not bidirectional)
- **Status Management**: Each content type has independent preview/published states
- **Reference Integrity**: Automatic cleanup when collections are deleted
- **Asset Tracking**: Automatic location tracking for assets in storylines
- **Settings System**: Centralized configuration with flexible key-value storage

### Type Safety

- **DTOs** ([`src/dtos/`](src/dtos/)) - Request/response data structures
- **Interfaces** ([`src/types/`](src/types/)) - Shared type definitions
- **Models** - Mongoose schemas with TypeScript interfaces
- **Constants** - Centralized HTTP status codes and other constants

## Performance Considerations

- **Efficient Queries**: Compound indexes for status + identifier lookups
- **Asset References**: Storylines reference assets for flexible relationships
- **Collection Indexes**: Optimized for status, name, and publishing lookups
- **Batch Operations**: Support for publishing multiple items at once
- **Settings Caching**: Efficient settings retrieval with categorization
- **Location Tracking**: Automatic asset location updates via Mongoose hooks
- **Duplicate Prevention**: Intelligent duplicate detection to prevent redundant uploads

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
