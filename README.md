# Powerbag API

A RESTful API built with Node.js, Express, TypeScript, and MongoDB for managing storylines, events, info content, and users in the Powerbag application.

## Features

- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Modular Architecture**: Clean separation of concerns with handlers, routes, and models
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Structured error responses and graceful shutdown
- **Environment Configuration**: Flexible configuration management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Security**: Bcrypt for password hashing
- **Environment**: dotenv for configuration

## Project Structure

```
src/
├── index.ts              # Application entry point
├── config/
│   └── database.ts       # MongoDB connection configuration
├── dtos/
│   └── CreateUser.dto.ts # Data transfer objects
├── handlers/
│   ├── events.ts         # Event handlers/controllers
│   ├── info.ts           # Info content handlers
│   ├── storyline.ts      # Storyline handlers
│   └── users.ts          # User handlers
├── models/
│   ├── Events.ts         # Event data model and schema
│   ├── Info.ts           # Info content model
│   ├── StoryLine.ts      # Storyline model with bags and stories
│   └── User.ts           # User model and authentication
├── routes/
│   ├── events.ts         # Event API endpoints
│   ├── info.ts           # Info content endpoints
│   ├── storyline.ts      # Storyline API endpoints
│   └── users.ts          # User API endpoints
└── types/
    ├── query-params.ts   # Query parameter interfaces
    └── response.ts       # Response type definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

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

## API Endpoints

### Storylines (`/api/storylines`)

Complete storyline management with preview/published workflow:

| Method   | Endpoint                     | Description                                |
| -------- | ---------------------------- | ------------------------------------------ |
| `GET`    | `/storylines`                | Get all storylines with optional filtering |
| `GET`    | `/storylines/:title`         | Get specific storyline by title            |
| `POST`   | `/storylines`                | Create or update a single storyline        |
| `PUT`    | `/storylines`                | Batch create or update storylines          |
| `DELETE` | `/storylines/:id`            | Delete specific storyline by ID            |
| `DELETE` | `/storylines`                | Delete all storylines                      |
| `GET`    | `/storylines/system/updates` | Check if updates are available             |
| `POST`   | `/storylines/:title/publish` | Publish specific storyline                 |
| `POST`   | `/storylines/publish/all`    | Publish all storylines                     |

**Query Parameters:**

- `status` - Filter by status (`preview` or `published`)
- `titles` - Filter by specific titles (array or single value)

### Events (`/api/events`)

Event tracking and management:

| Method   | Endpoint      | Description                              |
| -------- | ------------- | ---------------------------------------- |
| `GET`    | `/events`     | Get all events (sorted by creation date) |
| `POST`   | `/events`     | Create new events collection             |
| `DELETE` | `/events/:id` | Delete specific event by ID              |

### Info Content (`/api/info`)

Multi-language information content management:

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| `GET`  | `/info`     | Get info content             |
| `POST` | `/info`     | Create new info content      |
| `PUT`  | `/info/:id` | Update existing info content |

### Users (`/api/users`)

User account management:

| Method | Endpoint     | Description     |
| ------ | ------------ | --------------- |
| `GET`  | `/users`     | Get all users   |
| `GET`  | `/users/:id` | Get user by ID  |
| `POST` | `/users`     | Create new user |

## Data Models

### StoryLine

- `title` (string, required): Storyline title
- `status` (enum): `'preview'` or `'published'`
- `bags` (object): Three columns of bag items with images/videos
- `stories` (array): Story events with audio, timing, and bag selections
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Events

- `data` (array): Collection of event objects with timing and metadata
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### Info

- `en` (string, required): English content
- `nl` (string, required): Dutch content
- `createDate` / `updateDate` (Date): Auto-generated timestamps

### User

- `name` (string, required): User's full name
- `email` (string, required, unique): User's email address
- `password` (string, required): Hashed password (min 6 characters)
- `age` (number, optional): User's age (0-120)
- `createdAt` / `updatedAt` (Date): Auto-generated timestamps

## Example Requests

### Create Storyline

```bash
POST /api/storylines
Content-Type: application/json

{
  "title": "Adventure Story",
  "bags": {
    "firstColumn": [...],
    "secondColumn": [...],
    "thirdColumn": [...]
  },
  "stories": [...]
}
```

### Create Events

```bash
POST /api/events
Content-Type: application/json

[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "action": "user_interaction",
    "metadata": {...}
  }
]
```

### Create Info Content

```bash
POST /api/info
Content-Type: application/json

{
  "en": "English content here",
  "nl": "Nederlandse inhoud hier"
}
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
- `404` - Not Found
- `500` - Internal Server Error

## Environment Variables

| Variable      | Description               | Default                              |
| ------------- | ------------------------- | ------------------------------------ |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/powerbag` |
| `PORT`        | Server port               | `3000`                               |
| `NODE_ENV`    | Environment mode          | `development`                        |

## Database Configuration

MongoDB connection is managed through the [`database.ts`](src/config/database.ts) configuration:

- **Connection**: Automatic connection on server start
- **Disconnection**: Graceful disconnection on shutdown
- **Error Handling**: Comprehensive error logging and recovery

## Development Scripts

- `npm run dev` - Start development server with nodemon and ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server from compiled JavaScript
- `npm test` - Run tests (to be implemented)

## TypeScript Configuration

The project uses strict TypeScript settings defined in [`tsconfig.json`](tsconfig.json):

- **Module System**: Node.js ESNext modules
- **Strict Mode**: Enabled for type safety
- **Output**: Compiled to `dist/` directory
- **Source Maps**: Generated for debugging

## Architecture Patterns

### Request Flow

1. **Routes** ([`src/routes/`](src/routes/)) - Define API endpoints
2. **Handlers** ([`src/handlers/`](src/handlers/)) - Process business logic
3. **Models** ([`src/models/`](src/models/)) - Database operations
4. **Response** - Structured JSON responses

### Type Safety

- **DTOs** ([`src/dtos/`](src/dtos/)) - Request/response data structures
- **Interfaces** ([`src/types/`](src/types/)) - Shared type definitions
- **Models** - Mongoose schema with TypeScript interfaces

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- Email validation and uniqueness constraints
- Input sanitization and validation
- MongoDB injection protection via Mongoose
- Environment variable management

## Publishing Workflow

The storyline system supports a preview/published workflow:

1. **Preview Mode**: Create and edit storylines in `preview` status
2. **Publishing**: Use publish endpoints to promote preview content to `published` status
3. **Query Filtering**: Filter API responses by status for different environments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
