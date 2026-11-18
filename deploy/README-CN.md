# Luminara 国内部署

这套部署把前端、Node.js API 和 SQLite 数据库放在同一台 Ubuntu
服务器上，通过 Nginx 对外提供 HTTP/HTTPS。

## 推荐配置

- 腾讯云轻量应用服务器或阿里云 ECS
- Ubuntu 24.04 LTS
- 至少 2 核 CPU、2 GB 内存
- 香港节点：无需大陆备案，适合先上线
- 广州、上海等大陆节点：国内访问更稳定，但绑定域名前必须完成 ICP 备案
- 云防火墙只开放 TCP 22、80、443；不要公开 4173

网站包含约 74 MB 图片、视频和字体。访问量增加后，再把 `assets/`
迁移到腾讯云 COS 或阿里云 OSS + CDN。

## 首次部署

1. 把域名 A 记录指向服务器公网 IP。
2. 通过 SSH 登录服务器。
3. 上传并解压项目文件。
4. 在项目根目录运行：

```bash
sudo DOMAIN=www.example.com \
  LETSENCRYPT_EMAIL=you@example.com \
  bash deploy/install-ubuntu.sh
```

如果暂时没有域名，可以省略这两个变量，直接运行：

```bash
sudo bash deploy/install-ubuntu.sh
```

安装脚本会从国内可访问的 Node.js 镜像下载经过 SHA-256 校验的
Node.js 24，并完成 Nginx、systemd、持久化数据库目录、每日自动备份和
健康检查配置。域名与邮箱都提供时，还会申请 Let's Encrypt HTTPS 证书。

如果服务器没有域名，也可以先用公网 IP 访问。正式收款前仍建议绑定域名
并启用 HTTPS。

## 更新网站

把新版本上传到服务器后运行：

```bash
sudo bash deploy/update-ubuntu.sh /path/to/new-release
```

更新不会覆盖：

- `/var/lib/luminara/luminara.db`
- `/etc/luminara.env`

## 支付与邮件

编辑 `/etc/luminara.env`：

```bash
sudo nano /etc/luminara.env
sudo systemctl restart luminara
```

当前项目支持 Stripe Checkout 和 Resend 邮件通知。面向中国大陆客户时，
支付宝和微信支付需要另外接入；这不属于本次服务器迁移能够自动完成的部分。

## 数据库备份

安装脚本已经创建每日 03:20 左右的 SQLite 在线备份，保留最近 30 天。
也可以手动执行：

```bash
sudo bash deploy/backup-database.sh
```

查看下一次自动备份：

```bash
systemctl list-timers luminara-backup.timer
```

备份只保存在当前服务器。正式运营时建议再把 `/var/backups/luminara`
同步到腾讯云 COS 或阿里云 OSS。

## 排查

```bash
systemctl status luminara
journalctl -u luminara -n 100 --no-pager
nginx -t
curl http://127.0.0.1/api/health
```

健康检查应返回：

```json
{"ok":true,"currency":"USD","paymentsConfigured":false,"emailConfigured":false}
```

如果修改了域名或启用了支付、邮件，更新 `/etc/luminara.env` 后必须重启
站点：

```bash
sudo systemctl restart luminara
```
