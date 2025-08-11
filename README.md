# Powerbag API

A RESTful API built with Node.js, Express, TypeScript, and MongoDB for the Powerbag application.

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
│   └── *.dto.ts          # Data transfer objects
├── handlers/
│   └── *.ts              # Request handlers/controllers
├── models/
│   └── *.ts              # Mongoose models and schemas
├── routes/
│   └── *.ts              # API route definitions
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

## API Structure

The API follows RESTful conventions with the following patterns:

- **Routes**: Define API endpoints and HTTP methods
- **Handlers**: Process requests and business logic
- **Models**: Define data schemas and database interactions
- **DTOs**: Type-safe data transfer objects for request/response
- **Types**: Shared type definitions and interfaces

## Error Handling

The API returns structured error responses defined in [`ErrorResponse`](src/types/response.ts):

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

- Password hashing with bcrypt
- Input validation through Mongoose schemas
- MongoDB injection protection
- Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
