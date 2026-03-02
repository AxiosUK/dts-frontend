# Dockerfile (snippet)

# ---- Build stage ----
FROM node:25-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# install envsubst (gettext) for runtime templating (alpine example)
RUN apk add --no-cache gettext

# copy the env template and entrypoint
COPY public/env.js.template /usr/share/nginx/html/env.js.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]