FROM node:18-slim

RUN apt-get update && apt-get install -y curl bash unzip
RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
COPY package.json bun.lockb* ./

RUN bun install
COPY . .

EXPOSE 8001

CMD ["bun", "start"]
