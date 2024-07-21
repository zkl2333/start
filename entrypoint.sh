#!/bin/sh
set -e

echo "启动应用程序"

# 判断 data 目录是否存在 不存在就报错
if [ ! -d "./data" ]; then
  echo "必须映射 /app/data 目录"
  exit 1
fi

# 创建组（如果已存在则不会报错）
if ! getent group "$PGID" > /dev/null 2>&1; then
  echo "创建 nodejs 组"
  addgroup --system --gid "$PGID" nodejs >/dev/null 2>&1 || true
else
  group_name=$(getent group "$PGID" | cut -d: -f1)
  echo "组 PGID '$PGID' 已存在，组名为 '$group_name'"
fi

# 创建用户（如果已存在则不会报错）
if ! id "$PUID" > /dev/null 2>&1; then
  echo "创建 nextjs 用户"
  adduser --system --uid "$PUID" --ingroup nodejs nextjs >/dev/null 2>&1 || true
else
  user_name=$(getent passwd "$PUID" | cut -d: -f1)
  echo "用户 PUID '$PUID' 已存在，用户名为 '$user_name'"
fi

# 更改目录权限
echo "更改目录权限"
chown -R "$PUID":"$PGID" /app/.next /app/public /app/data 


# 切换到新用户
exec gosu "$PUID":"$PGID" "$@"
