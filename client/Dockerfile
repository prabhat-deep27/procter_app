# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

# Build Vite app
RUN npm run build


# ---------- Run stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

