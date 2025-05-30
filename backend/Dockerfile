# Production image
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Gereksiz devDependencies silinir
RUN npm prune --production

EXPOSE 3001

CMD ["node", "src/index.js"]
