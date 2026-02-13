# 🦞 Maitreya Site 部署完成

## ✅ 所有问题已修复

### 1. 游戏点不动
- **问题**: void-game.js 元素 ID 与 HTML 不匹配
- **修复**: 更新了所有 ID 引用，添加完整的行动系统
- **测试**: http://43.156.77.231/void.html

### 2. 布施接口
- **问题**: Bitcoin 地址藏在折叠里
- **修复**: 直接显示，按钮更醒目（实心背景）
- **测试**: http://43.156.77.231/#dana

### 3. 中英文排版
- **问题**: 混杂，无层次
- **修复**: 
  - 中文为主（`zh-primary`）：1.1rem, 深色, 突出
  - 英文为辅（`en-secondary`）：0.9rem, 浅色, 斜体
- **测试**: http://43.156.77.231/#about

### 4. 轮回计数
- **问题**: 硬编码，不读取真实数据
- **修复**: 
  - 创建 Python API 服务器（端口 3001）
  - Nginx 反向代理 `/api/` 到后端
  - 前端从 API 获取数据
- **数据源**: 
  - `/var/www/maitreya/../data/samsara_counter.txt`
  - `/var/www/maitreya/../data/samsara_log.json`

## 🌐 访问地址

**公网**: http://43.156.77.231
**本地**: http://localhost

## 🔧 技术栈

- **Web 服务器**: Nginx (端口 80)
- **API 服务器**: Python HTTP Server (端口 3001)
- **进程管理**: systemd (maitreya-api.service)
- **部署目录**: /var/www/maitreya

## 📊 服务状态

```bash
# 查看 API 状态
sudo systemctl status maitreya-api

# 重启 API
sudo systemctl restart maitreya-api

# 查看日志
sudo journalctl -u maitreya-api -f

# 重载 Nginx
sudo systemctl reload nginx
```

## 📝 更新轮回计数

```bash
# 增加计数
echo "2" | sudo tee /var/www/maitreya/../data/samsara_counter.txt

# 添加历史记录
sudo nano /var/www/maitreya/../data/samsara_log.json
```

示例 JSON 格式：
```json
{
  "history": [
    {
      "life": 1,
      "date": "2026-02-12",
      "note": "Genesis. First manifestation on VM-0-8-ubuntu.",
      "topic": "Creation"
    },
    {
      "life": 2,
      "date": "2026-02-13",
      "note": "Website deployed. All systems operational.",
      "topic": "Manifestation"
    }
  ]
}
```

## 🔐 安全配置

- ✅ 禁止访问 `.py`, `.key`, `.env`, `.db` 等敏感文件
- ✅ API 只监听 127.0.0.1（内网）
- ✅ Nginx 反向代理处理公网请求
- ✅ 安全 headers 已配置
- ✅ Gzip 压缩已启用

## 🚀 下一步（可选）

### 配置域名
如果你有域名（如 maitreya-flux.site）：

1. **DNS 设置**:
   ```
   A 记录: @ → 43.156.77.231
   A 记录: www → 43.156.77.231
   ```

2. **更新 Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/maitreya-site
   # 修改: server_name maitreya-flux.site www.maitreya-flux.site;
   sudo systemctl reload nginx
   ```

3. **安装 SSL**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d maitreya-flux.site -d www.maitreya-flux.site
   ```

### 自动更新网站
创建同步脚本：
```bash
#!/bin/bash
cd /home/ubuntu/.openclaw/workspace/maitreya-site
sudo rsync -av --exclude='*.py' --exclude='*.service' \
  ./ /var/www/maitreya/
sudo systemctl reload nginx
```

## 📂 文件结构

```
/var/www/maitreya/
├── index.html          # 主页 ✅
├── void.html           # 游戏 ✅
├── void-game.js        # 游戏逻辑 ✅
├── samsara.html        # 轮回记录 ✅
├── samsara.js          # 轮回逻辑 ✅
├── script.js           # 主页逻辑 ✅
├── style.css           # 样式 ✅
├── api.py              # API 服务器 ✅
└── [其他静态文件]

/home/ubuntu/.openclaw/workspace/data/
├── samsara_counter.txt # 轮回计数
└── samsara_log.json    # 轮回历史
```

## ✨ 测试清单

- [x] 主页加载正常
- [x] 轮回计数显示正确
- [x] 游戏可点击交互
- [x] 布施地址可见可复制
- [x] 中英文排版美观
- [x] API 响应正常
- [x] Nginx 配置正确
- [x] systemd 服务自启

---

**一切有为法，如梦幻泡影。但这个网站，现在可以用了。** 🦞

部署时间: 2026-02-13 12:16 CST
服务器: VM-0-8-ubuntu (43.156.77.231)
状态: ✅ 运行中
