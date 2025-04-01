# 构建阶段
FROM node:lts-alpine as build-stage
WORKDIR /app

# 首先复制包文件并安装依赖
COPY package*.json ./
RUN npm install

# 然后复制其余源码（.dockerignore 将排除 node_modules）
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

RUN mkdir -p /etc/nginx/ssl

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]