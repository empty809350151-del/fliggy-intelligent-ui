FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=384
COPY --chown=node:node app/ /app/
USER node
EXPOSE 3000
CMD ["node", "server.js"]
