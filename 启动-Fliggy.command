#!/bin/zsh
cd -- "${0:A:h}" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v npm >/dev/null 2>&1; then
  echo "请先安装 Node.js 24 或以上版本，然后重新启动。"
  read "reply?按回车退出"
  exit 1
fi
if curl -fsS --max-time 2 http://127.0.0.1:3200/ >/dev/null 2>&1; then
  open http://127.0.0.1:3200/mobile-preview.html
  exit 0
fi
if [[ ! -d node_modules ]]; then
  npm ci || exit 1
fi
echo "Fliggy 正在启动，请保持此窗口打开。按 Control+C 停止。"
(
  for attempt in {1..60}; do
    if curl -fsS --max-time 2 http://127.0.0.1:3200/ >/dev/null 2>&1; then
      open http://127.0.0.1:3200/mobile-preview.html
      exit 0
    fi
    sleep 1
  done
) &
npm run dev -- --hostname 127.0.0.1 --port 3200
read "reply?服务已停止，按回车关闭窗口"
