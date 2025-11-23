# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
# No lock file found, so we'll just use package.json
COPY package.json .
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port Nginx will listen on (as defined in nginx.conf)
EXPOSE 8080

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
