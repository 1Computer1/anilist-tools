FROM node:lts AS build

WORKDIR /workdir

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /workdir/dist /usr/share/nginx/html
