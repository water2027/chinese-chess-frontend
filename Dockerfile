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
# 复制 nginx 配置（如果有的话）
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]