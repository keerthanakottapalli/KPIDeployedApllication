FROM node:16-alpine

WORKDIR /updatedCode-171023--main

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000
FROM nginx
COPY index.html /usr/share/nginx/html
EXPOSE 80

CMD ["npm","start"]