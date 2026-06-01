FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_CLAIMS_API_URL=http://localhost:3000
ARG VITE_AUDIT_API_URL=http://localhost:3001
ARG VITE_USER_API_URL=http://localhost:3002
ARG VITE_OBJECT_API_URL=http://localhost:3003
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
