FROM node:18-alpine AS base

# 仅在需要时安装依赖项
FROM base AS deps
# 查看 https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine 了解为什么可能需要 libc6-compat。
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 根据首选的包管理器安装依赖项
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "未找到锁文件。" && exit 1; \
  fi

# 仅在需要时重新构建源代码
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 收集有关一般使用情况的完全匿名的遥测数据。
# 在此处了解更多信息：https://nextjs.org/telemetry
# 如果你想在构建期间禁用遥测，请取消注释以下行。
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "未找到锁文件。" && exit 1; \
  fi

# 生产镜像，复制所有文件并运行 next
FROM base AS runner
WORKDIR /app

# 安装 gosu
ENV GOSU_VERSION=1.17
RUN set -eux; \
	\
	apk add --no-cache --virtual .gosu-deps \
		ca-certificates \
		dpkg \
		gnupg \
	; \
	\
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	\
# verify the signature
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc; \
	\
# clean up fetch dependencies
	apk del --no-network .gosu-deps; \
	\
	chmod +x /usr/local/bin/gosu; \
# verify that the binary works
	gosu --version; \
	gosu nobody true

ENV NODE_ENV=production
# 如果你想在运行时禁用遥测，请取消注释以下行。
# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# 为 prerender 缓存设置正确的权限
RUN mkdir .next

# 自动利用输出跟踪以减少镜像大小
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

ENV PUID=1000
ENV PGID=1000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
VOLUME /app/.next/cache
VOLUME /app/data

ENTRYPOINT ["./entrypoint.sh"]

# 启动应用程序
# server.js 是由 next build 从 standalone 输出创建的
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
