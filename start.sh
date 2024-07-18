#!/bin/sh

echo "启动应用程序"

# 判断 data 目录是否存在 不存在就报错
if [ ! -d "./data" ]; then
  echo "必须映射 /app/data 目录"
  exit 1
fi

# 启动应用程序
# server.js 是由 next build 从 standalone 输出创建的
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
exec node server.js
