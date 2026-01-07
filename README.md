# Boxfindr

**Boxfindr** is a modern, web-based inventory management system designed to help you organize your items, cabinets, and crates with ease. Built with a focus on usability and mobile-first design, it makes tracking your belongings simple and efficient.

## Features

- **cabinet & Crate Management**: Organize your storage into physical cabinets and crates (boxes).
- **Item Tracking**: Keep track of item quantities, locations, and low-stock alerts.
- **Move & Copy**: Easily move items between boxes or copy existing item templates to new locations.
- **QR Code Support**: Ready for QR code integration for quick scanning and lookup.
- **User Roles**: Role-based access control (Admin/User) to secure sensitive operations.
- **Mobile Friendly**: Responsive UI built with [Shadcn UI](https://ui.shadcn.com/) and Tailwind CSS.
- **Theme Support**: Dark and Light mode support.

## Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router, React 19), Tailwind CSS, Shadcn UI.
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript), Prisma ORM.
- **Database**: PostgreSQL.
- **Authentication**: JWT-based auth with passport.

## Getting Started

### Prerequisites

- Node.js (v20+)
- Docker (for the database)
- npm or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mrclk3/Boxfindr.git
    cd Boxfindr
    ```

2.  **Start the Database:**
    Boxfindr includes a `docker-compose.yml` for quickly spinning up a PostgreSQL instance.
    ```bash
    docker-compose up -d
    ```

3.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    
    # Set up environment variables
    # (Copy .env.example to .env and configure DATABASE_URL if needed)
    
    # Run database migrations and seed data
    npx prisma migrate dev
    npx prisma db seed
    
    # Start the backend server
    npm run start:dev
    ```
    The backend runs on `http://localhost:3000`.

4.  **Frontend Setup:**
    Open a new terminal.
    ```bash
    cd frontend
    npm install
    
    # Start the frontend development server
    npm run dev
    ```
    The frontend runs on `http://localhost:3001` (by default).

### Default Credentials
- **Admin**: `admin@codelab.eu` / `admin123`
- **User**: `user@codelab.eu` / `user123`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
