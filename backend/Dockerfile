FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
