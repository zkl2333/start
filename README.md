# 这是一个自部署的网址导航和简单的应用程序仪表板

## 基于 Docker Component 部署

```yaml
version: "3"
services:
  start:
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - "3000:3000"
    volumes:
      - /path/to/docker/data:/app/data
      - /path/to/docker/data/cache:/app/.next/cache
    image: ghcr.io/zkl2333/start:main
```

## 开发

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
