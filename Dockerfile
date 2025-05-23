# Base image
FROM node:22-alpine

# Set working dir
WORKDIR /letenjoyyourmeals/website

# Copy only package files first for better caching
COPY website/package*.json ./
RUN npm install

# Copy source code of website
COPY website .

# Copy shared folder (must be done from root)
COPY shared ../shared

# Build
RUN npm run build

# Serve
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
