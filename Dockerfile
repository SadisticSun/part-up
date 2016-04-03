FROM node:0.10-slim

EXPOSE 3000

RUN apt-get update && \
    apt-get install -y imagemagick --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get autoclean && \
    apt-get clean

ADD app-build/meteor-app.tgz /app

CMD node /app/main.js
