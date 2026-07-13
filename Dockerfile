FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY public ./public
COPY src ./src
COPY scripts ./scripts
RUN mkdir -p /app/var && chown -R node:node /app
USER node
ENV HOST=0.0.0.0 PORT=7799 OPHRYS_DB_PATH=/app/var/ophrys.sqlite
EXPOSE 7799
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:7799/api/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "src/server.mjs"]
