# Chat-App Backend

Welcome to the backend repository for the Chat-App, where the magic happens behind the scenes. This repository contains the server-side codebase responsible for managing user authentication, real-time messaging, and database interactions.

## Technologies Used

- **Express.js**: The server is built using Express.js, a popular web application framework for Node.js. It provides routing, middleware, and other essential features for building robust backend applications.

- **TypeScript**: The project is written in TypeScript, which adds static typing to JavaScript, making the codebase more maintainable and less error-prone.

- **Socket.io**: For real-time communication, we use Socket.io, allowing for instant message delivery and chat functionality.

- **Mongoose**: Mongoose is employed to interact with a MongoDB database, making it easy to store and retrieve chat messages and user data.

- **JWT (jsonwebtoken)**: JSON Web Tokens are used for user authentication and secure data transmission.

- **bcryptjs**: To securely hash and compare passwords, we use bcryptjs, ensuring user data is stored safely.

- **Express Middleware**:
  - **express-mongo-sanitize**: Used for sanitizing user input and protecting against MongoDB injection attacks.
  - **express-rate-limit**: Implementing rate limiting to protect against abuse and unauthorized access.
  - **helmet**: Enhancing security by setting HTTP headers.
  - **cors**: Managing Cross-Origin Resource Sharing for API access.
  - **compression**: Compressing HTTP responses for improved performance.
  
- **rimraf**: For cleaning the build output directory.

## Scripts

- `npm run build`: Compile TypeScript code and create a production-ready build.
- `npm run ts.check`: Check TypeScript code for errors.
- `npm run add-build`: Add the build output to version control.
- `npm start`: Start the production server.
- `npm run dev`: Run the development server with automatic TypeScript recompilation using concurrently and nodemon.

## Prerequisites

Before running this project, ensure you have Node.js and npm installed on your system. You should also set up a MongoDB database and configure the environment variables.

## Getting Started

1. Clone this repository.
2. Install dependencies with `npm install`.
3. Create a `.env` file with necessary environment variables (e.g., database connection details, JWT secrets).
4. Run the development server using `npm run dev` or start the production server using `npm start`.

Feel free to contribute, report issues, or use this codebase as a foundation for your own chat application's backend. Happy coding!
