# Chuanda Cai Academic Homepage

这是一个支持中文和英文切换的学术个人主页，适用于直接部署到 GitHub Pages。页面使用纯 HTML、CSS、JavaScript 和 JSON 构建，不依赖复杂框架。

## 仓库信息

```text
GitHub username: guuacel
Repository name: guuacel.github.io
GitHub Pages URL: https://guuacel.github.io
```

## 文件结构说明

```text
index.html                         # GitHub Pages 入口页面，必须位于仓库根目录
assets/css/style.css               # 主样式文件
assets/js/main.js                  # 页面渲染、中英文切换、导航和交互逻辑
assets/data/profile.json           # 中英文个人信息与页面内容数据
assets/img/                        # 头像、图片和 favicon 等静态图片
docs/customization-guide.md        # 自定义修改指南
.nojekyll                          # 禁用 GitHub Pages 的 Jekyll 处理
deploy_check_report.md             # 部署检查报告
```

## 如何修改个人信息

主要修改文件：

```text
assets/data/profile.json
```

该文件同时包含中文 `zh` 和英文 `en` 两套内容。修改个人信息时，请尽量同步更新两个语言版本，包括：

1. 姓名；
2. 学校；
3. 学术身份；
4. 个人简介；
5. 研究方向；
6. 论文成果；
7. 科研项目；
8. 专利与软著；
9. 获奖情况；
10. 联系方式；
11. 中英文内容。

如果某个链接暂时没有真实地址，可以使用 `#` 或 `TODO` 占位。

## 如何替换头像

将头像文件放入：

```text
assets/img/
```

然后修改 `assets/data/profile.json` 中两处头像路径：

```json
"avatar": "assets/img/avatar-placeholder.png"
```

例如替换为：

```json
"avatar": "assets/img/avatar.jpg"
```

## 本地预览方法

如果直接双击 `index.html` 后无法读取 `profile.json`，请使用本地静态服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## GitHub Pages 部署方法

1. 在 GitHub 创建仓库：

```text
guuacel.github.io
```

2. 将 `guuacel.github.io/` 文件夹中的所有内容上传到该仓库根目录。

3. 进入 GitHub 仓库设置：

```text
Settings → Pages
```

4. 在 Build and deployment 中选择：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

5. 保存后访问：

```text
https://guuacel.github.io
```

## Git 命令上传方法

```bash
cd guuacel.github.io
git init
git add .
git commit -m "Initial academic homepage"
git branch -M main
git remote add origin https://github.com/guuacel/guuacel.github.io.git
git push -u origin main
```

如果远程仓库已经存在或 remote 已经添加，请检查并更新：

```bash
git remote -v
git remote set-url origin https://github.com/guuacel/guuacel.github.io.git
git push -u origin main
```

不要使用 force push 覆盖已有远程仓库内容，除非你确认远程内容可以被覆盖。

## 常见问题

1. 页面 404：检查 `index.html` 是否位于仓库根目录。
2. 样式丢失：检查 `assets/css/style.css` 路径是否正确。
3. 中英文切换失败：检查 `assets/data/profile.json` 是否是合法 JSON。
4. 图片不显示：检查图片是否位于 `assets/img/`，并确认路径大小写一致。
5. 页面未更新：等待 GitHub Pages 部署完成，或清理浏览器缓存。
6. 本地双击无法读取 JSON：使用 `python -m http.server 8000`。

## 语言切换说明

默认语言为中文。点击导航栏中的 `English` 后切换到英文；点击 `中文` 后切回中文。语言选择会保存到浏览器 `localStorage`，刷新页面后保持上次选择。

