# Builder stage

FROM node:18-alpine AS builder

WORKDIR /app

COPY package*json ./

RUN npm install

COPY . .

RUN npm run build

# Server the html files through nginx

FROM nginx:alpine AS runner

# Remove the default Nginx index.html
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage into Nginx/usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# starts the nginx
CMD ["nginx", "-g", "daemon off;"]
