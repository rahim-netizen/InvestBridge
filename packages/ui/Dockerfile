FROM node:22-alpine

WORKDIR /app

EXPOSE 5173

# Install dependencies (into the container's own node_modules, kept in a volume)
# then start the Vite dev server bound to all interfaces for Docker access.
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
