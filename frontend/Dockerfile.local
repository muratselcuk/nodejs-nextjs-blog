FROM node:18

# ARG'ler burada tanımlanmalı
ARG API_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL

# Bunları ENV'e aktar (Next.js build için gerekli)
ENV API_BASE_URL=$API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Çalışma dizini
WORKDIR /app

# package.json ve lock dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları kur
RUN npm install

# Diğer tüm dosyaları kopyala
COPY . .

# Production build
RUN npm run build

# Uygulamayı başlat
EXPOSE 3000
CMD ["npm", "start"]
