# 阿里云独立部署

已部署至 47.253.226.200 的 /opt/openui-fliggy。
公网入口：https://fliggy.47-253-226-200.sslip.io/
必须使用 HTTPS；80 端口保留给已有服务，不设置 HTTP 跳转。

## 已验证

- 发布包 SHA256：2569c26b2c6c66b24998b9b0119fc20651e139114281171107816178e3f40f06。
- Linux Docker 构建和启动成功，fliggy-app / fliggy-proxy / fliggy-https 均运行。
- Let's Encrypt 证书签发成功，服务器通过正常 TLS 校验访问域名首页 HTTP 200。
- 首页引用的 18 个 Next.js 静态资源全部 HTTP 200。
- HTTPS /api/chat 真实模型请求 HTTP 200，并收到 response.completed；沿用项目 DeepSeek 配置。
- runtime.env 权限 600、root 所有，不包含在发布压缩包中。
- 原 personal-browser-agent、personal-trendradar 容器持续运行，原 80 端口进程 PID 3367234 未变；未改已有项目配置及防火墙。

验证边界：当前本机网络将 sslip.io 域名解析至错误 IP，Chrome 显示 ERR_CONNECTION_CLOSED；指定正确 IP 后本机 TLS 连接仍被关闭。服务器端 HTTPS 与模型验证成功，但尚未完成独立外部浏览器端验收。应通过手机移动网络进一步验证，不将本机连接失败等同于服务器宕机。

## 隔离与限流

独立 Compose 项目 openui-fliggy、网络 openui-fliggy-network、容器、证书卷和目录。应用非 root、只读根文件系统，无 Docker socket 或宿主业务目录挂载。app 512MB / 0.75CPU，nginx 64MB，Caddy 96MB。公网仅新增 HTTPS 443，内部代理绑定 127.0.0.1:13100。
每 IP 每分钟 6 次、全站每分钟 30 次、同 IP 同时 3 个 chat 连接；限流不是账单硬限额。公网用户调用会消耗所配置的 DeepSeek 额度。

## 运维

在服务器 /opt/openui-fliggy 中执行：

```sh
docker compose -p openui-fliggy --profile public ps
docker compose -p openui-fliggy logs --tail 100 app proxy
docker compose -p openui-fliggy --profile public logs --tail 100 https
```

更新前保留上一版发布文件及 runtime.env；新包不得覆盖密钥。更新应用后执行：

```sh
docker compose -p openui-fliggy up -d --build app proxy
```

停止本项目（保留证书卷，不影响其他项目）：

```sh
docker compose -p openui-fliggy --profile public down
```

本机构建：FLIGGY_BUILD_DIR=.next-deploy npm run build。
发布包 outputs/fliggy-aliyun-release.tgz 不含密钥；不要直接打包含 runtime.env 的暂存目录。

## 2026-10-22 公网复查

用户反馈移动网络不可访问。独立 check-host.net HTTP 探测（request_id 527c03a3k679）返回成功 HTTP 200，目标 IP 为 47.253.226.200（可见哈萨克斯坦与美国节点成功）。服务器本机 HTTPS 仍为 200。电脑网络返回明确的“云壳”域名安全策略拦截 403，解析到 59.82.113.122；这不能直接解释手机移动网络的问题。等待手机具体错误及浏览器信息，尚未确认用户端恢复。
