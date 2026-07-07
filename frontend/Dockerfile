FROM node:20-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- Production stage ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
