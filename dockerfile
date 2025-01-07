# Stage 1: Build Angular App
FROM node:18 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Angular app (output to /dist)
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy Angular build artifacts to Nginx web root
COPY --from=build /app/dist/ng-chatbot-frontend/browser /usr/share/nginx/html

# Copy public assets (e.g., error pages)
COPY public /app/public

# Copy SSL certificates to Nginx container
COPY ssl/certs/nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt
COPY ssl/private/nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key

# Copy custom Nginx configuration to enable HTTPS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for HTTP and HTTPS traffic
EXPOSE 80 443

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
