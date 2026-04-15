# Sunnah Now API

Offline dumps are available here: https://github.com/sunnah-now/database/releases/tag/v0.1.0

The API for Sunnah.now. It uses the Next.js App Router and TypeScript.

Documentation is available at [docs.sunnah.now](https://docs.sunnah.now).
You can also enter early access at [early-access.sunnah.now](https://early-access.sunnah.now).

## Getting Started
To make life easier, we have created a monorepo that pre-contains all the components of the Sunnah.now project, including the API, documentation, and database dumps.
This allows for easier maintenance and contributions. Make sure to check it out here: https://github.com/sunnah-now/monorepo

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export REDIS_ADDR=localhost:6379
   export REDIS_PASSWORD=your_password
   export REDIS_DB=0
   ```

3. Load data into Redis:
   ```bash
   npm run load-data
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## API Routes
See documentation: [docs.sunnah.now](https://docs.sunnah.now/api) for detailed API documentation, including request/response samples.

- `GET /api/v1/books`: List all books.
- `GET /api/v1/book/:slug`: Get book metadata.
- `GET /api/v1/book/:slug/list`: List hadiths in a book (paginated).
- `GET /api/v1/book/:slug/list/:id`: Get a specific hadith by ID.
- `GET /api/v1/book/:slug/chapter`: List chapters in a book.
- `GET /api/v1/book/:slug/chapter/:id`: List hadiths in a specific chapter (paginated).

## Management Routes

> **Note**: These routes require the `MASTER_TOKEN` environment variable to be set in your `.env.local` or environment. All management requests must include the `X-API-Key` header with your master token.

- `POST /management/token/:token`: Add a new API token.
- `DELETE /management/token/:token`: Remove an API token.
- `GET /management/analytics/:token?day=YYYY-MM-DD`: Get usage analytics for a token on a specific day.

## Health Check

- `GET /health`: Basic health check endpoint.

## Contributing

Found a mistake? Don't wait, report to info@sunnah.now; or get rewarded by fixing it yourself by creating a pull request: https://github.com/sunnah-now/database
