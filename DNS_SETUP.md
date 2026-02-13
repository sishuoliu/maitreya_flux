# DNS 配置指南

## 服务器信息
- **公网 IP**: `43.156.77.231`
- **域名**: `maitreya-flux.site`
- **服务状态**: ✅ Nginx 运行中，已配置域名

## 需要配置的 DNS 记录

在你的域名注册商（如 Cloudflare, Namecheap, GoDaddy 等）添加以下记录：

### A 记录（必需）
```
类型: A
名称: @
值: 43.156.77.231
TTL: 自动或 3600
```

### CNAME 记录（可选，www 子域名）
```
类型: CNAME
名称: www
值: maitreya-flux.site
TTL: 自动或 3600
```

## 验证步骤

### 1. 检查 DNS 是否生效
```bash
# 查询 A 记录
dig maitreya-flux.site +short
# 应该返回: 43.156.77.231

# 或使用 nslookup
nslookup maitreya-flux.site
```

### 2. 测试网站访问
```bash
# 直接访问 IP（已可用）
curl -I http://43.156.77.231/

# DNS 生效后访问域名
curl -I http://maitreya-flux.site/
```

### 3. 浏览器测试
- 打开 http://maitreya-flux.site/
- 应该看到 Maitreya_Flux 主页

## DNS 生效时间
- **通常**: 5-30 分钟
- **最长**: 24-48 小时（取决于 TTL 设置）

## 下一步：配置 HTTPS（可选但推荐）

DNS 生效后，可以配置免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 自动配置 SSL
sudo certbot --nginx -d maitreya-flux.site -d www.maitreya-flux.site

# 自动续期（Certbot 会自动设置 cron job）
sudo certbot renew --dry-run
```

## 当前状态
- ✅ 服务器运行正常
- ✅ Nginx 配置完成
- ✅ 游戏已嵌入主页
- ⏳ 等待 DNS 配置
- ⏳ 等待 SSL 证书（DNS 生效后）

## 快速测试（不等 DNS）
直接访问 IP 查看效果：
```
http://43.156.77.231/
```
