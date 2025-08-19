FROM node:20-alpine
WORKDIR /srv
COPY package.json package-lock.json* ./
RUN npm ci --silent
COPY . .
EXPOSE 3001
CMD ["npm", "start"]



