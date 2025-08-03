# BikfayaList - Classified Listing Platform

A modern, full-featured classified listing web application built with Next.js, Tailwind CSS, and Prisma.

## Features

### 🔐 Authentication & Authorization
- Secure login/register with NextAuth.js
- Role-based access control (Admin/User)
- Protected routes and API endpoints

### 🗂 Listing Management
- Create, edit, delete listings
- Image upload with drag-and-drop
- Categories and search filters
- Status management (Active/Pending/Archived)

### 🌐 Public Interface
- Homepage with featured listings
- Advanced search and filtering
- Responsive design for all devices
- SEO-optimized pages

### 👤 User Dashboard
- Manage personal listings
- View statistics and analytics
- Profile management

### 🛡 Admin Panel
- User management
- Listing moderation
- Platform statistics
- Content management

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **File Upload**: UploadThing integration ready
- **UI Components**: Radix UI components via shadcn/ui

## Getting Started

### Prerequisites
- Node.js 18+ 
- NPM or Yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bikfayalist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma db push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
/app
  /api              # API routes
  /auth             # Authentication pages
  /browse           # Browse listings
  /dashboard        # User dashboard
  /listing/[id]     # Listing details
  /admin            # Admin panel
/components         # Reusable components
/lib               # Utilities and configurations
/prisma            # Database schema and migrations
```

## Database Schema

The application uses a relational database with the following main entities:

- **Users**: User accounts with roles and profiles
- **Categories**: Listing categories for organization
- **Listings**: Main classified listings with images and metadata
- **Messages**: Communication between users (planned feature)

## API Endpoints

### Public Endpoints
- `GET /api/listings` - Fetch listings with filters
- `GET /api/listings/[id]` - Get single listing
- `GET /api/categories` - Get all categories

### Protected Endpoints
- `POST /api/listings` - Create new listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Admin Endpoints
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management

## Demo Credentials

For testing purposes, you can use any email address with the password `password123`.

Sample accounts:
- **Admin**: admin@bikfayalist.com / password123
- **User**: john@example.com / password123
- **User**: jane@example.com / password123

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Database Setup (Production)

For production, replace SQLite with PostgreSQL:

1. Set up a PostgreSQL database (Railway, Supabase, etc.)
2. Update `DATABASE_URL` in your environment variables
3. Run migrations: `npx prisma db push`
4. Seed the database: `npm run db:seed`

## Environment Variables

Required for production:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
UPLOADTHING_SECRET="ut_secret_..."
UPLOADTHING_APP_ID="your-app-id"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub or contact the development team.