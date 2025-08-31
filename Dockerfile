FROM node:18

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    libvips-dev \
    libpng-dev \
    libjpeg-dev \
    libglib2.0-dev \
    build-essential \
    python3 \
    pkg-config \
    chromium \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*
    
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./

RUN npm install --include=optional
RUN npm rebuild sharp --build-from-source


COPY . .

EXPOSE 3001

CMD [ "node", "server.js" ]