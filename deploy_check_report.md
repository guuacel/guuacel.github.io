# Deploy Check Report

生成时间：2026-06-05  
目标仓库目录：`guuacel.github.io/`  
目标 GitHub Pages 地址：`https://guuacel.github.io`

## 1. 最终文件结构

```text
guuacel.github.io/
├── index.html
├── README.md
├── .nojekyll
├── deploy_check_report.md
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── data/
│   │   └── profile.json
│   └── img/
│       └── avatar-placeholder.png
├── code/
│   ├── README.md
│   ├── gateway-assisted-fine-grained-data-sharing/
│   ├── bcdap-dgs/
│   ├── keyword-semantic-ciphertext-retrieval/
│   ├── dwtat-dasis/
│   ├── ouvc-vdb/
│   ├── lightweight-traceable-data-circulation/
│   ├── ghost-weight-protocol/
│   └── low-distortion-reversible-database-watermarking/
└── docs/
    └── customization-guide.md
```

## 2. GitHub Pages 必要文件

| 检查项 | 状态 | 说明 |
|---|---:|---|
| `index.html` 位于根目录 | 通过 | `guuacel.github.io/index.html` 存在 |
| `.nojekyll` 位于根目录 | 通过 | 文件存在且为空 |
| `assets/` 位于根目录 | 通过 | CSS、JS、JSON、图片均在该目录 |
| `code/` 位于根目录 | 通过 | 每篇论文均已有代码占位目录 |
| 无二级嵌套目录 | 通过 | 不存在 `guuacel.github.io/guuacel.github.io/index.html` |
| 未生成 zip | 通过 | 未创建压缩包 |

## 3. 资源路径检查

| 资源 | 路径 | 状态 |
|---|---|---:|
| CSS | `assets/css/style.css` | 通过 |
| JavaScript | `assets/js/main.js` | 通过 |
| JSON | `assets/data/profile.json` | 通过 |
| 头像图片 | `assets/img/avatar-placeholder.png` | 通过 |
| favicon | `assets/img/avatar-placeholder.png` | 通过 |

HTTP 本地静态服务器检查结果：

```text
200 http://localhost:8000/
200 http://localhost:8000/assets/css/style.css
200 http://localhost:8000/assets/js/main.js
200 http://localhost:8000/assets/data/profile.json
200 http://localhost:8000/assets/img/avatar-placeholder.png
```

## 4. 路径和链接检查

| 检查项 | 状态 | 说明 |
|---|---:|---|
| Windows 绝对路径 | 通过 | 未发现本地绝对路径 |
| 本机临时文件路径 | 通过 | 未发现本机文件协议或临时路径 |
| 文件名大小写 | 通过 | HTML、CSS、JS、JSON、PNG 引用大小写一致 |
| 无效本地资源 | 通过 | 核心本地资源 HTTP 检查均返回 200 |
| 外部链接 | 通过 | GitHub、Google Scholar、ORCID 为真实 URL |
| 占位链接 | 需用户补充 | ResearchGate、CV、PDF、部分专利编号和会议名仍使用占位 |

## 5. 中英文切换检查

| 检查项 | 状态 | 说明 |
|---|---:|---|
| 默认语言为中文 | 通过 | `main.js` 默认 `zh` |
| English 按钮切换英文 | 通过 | 导航栏按钮切换为 `en` |
| 中文按钮切回中文 | 通过 | 导航栏按钮切换为 `zh` |
| 使用 `localStorage` 保存语言 | 通过 | key 为 `guuacel-homepage-language` |
| 刷新后语言保持 | 通过 | 初始化时读取 `localStorage` |
| 首页、导航栏、About、Research、Publications、Projects、Patents、Tools、Contact 均可切换 | 通过 | `profile.json` 中 `zh` 与 `en` 字段完整 |
| 页面输出空值占位词 | 通过 | 源码扫描未发现相关空值字面量，渲染函数也有 fallback |
| `profile.json` 合法性 | 通过 | 已通过 UTF-8 JSON 解析 |
| 原始数据恢复 | 通过 | 已从上一层项目恢复完整论文、科研项目、专利软著等数据，荣誉奖励数据已归档 |

## 6. README 和文档

| 检查项 | 状态 |
|---|---:|
| `README.md` 已生成 | 通过 |
| README 包含项目简介 | 通过 |
| README 包含仓库信息 | 通过 |
| README 包含文件结构说明 | 通过 |
| README 包含个人信息修改说明 | 通过 |
| README 包含头像替换说明 | 通过 |
| README 包含本地预览方法 | 通过 |
| README 包含 GitHub Pages 部署方法 | 通过 |
| README 包含 Git 命令上传方法 | 通过 |
| README 包含常见问题 | 通过 |
| `docs/customization-guide.md` 已生成 | 通过 |

## 7. Git 状态

| 检查项 | 状态 | 说明 |
|---|---:|---|
| 本地 Git 仓库已初始化 | 通过 | 已执行 `git init` |
| 默认分支设置为 `main` | 通过 | 已执行 `git branch -M main` |
| 远程仓库已配置 | 通过 | `origin` 指向 `https://github.com/guuacel/guuacel.github.io.git` |
| 初始 commit | 通过 | 本报告随初始提交一起提交 |
| 是否 push 到远程 | 通过 | 已执行 `git push -u origin main` |

## 8. GitHub CLI

| 检查项 | 状态 | 说明 |
|---|---:|---|
| `gh` 是否可用 | 未安装 | 当前环境未识别 `gh` 命令 |
| GitHub 连接器账号 | 匹配 | 当前目标账号已调整为 `guuacel` |
| 是否创建远程仓库 | 通过 | 已通过本机 Git 凭据调用 GitHub API 创建 `guuacel/guuacel.github.io` |

## 9. 仍需用户手动补充的 TODO

1. 补充学院、实验室、导师、教育经历起止时间。
2. 替换 `assets/img/avatar-placeholder.png` 为真实头像。
3. 补充 CV 文件并更新 `profile.json` 中的 `cv` 链接。
4. 补充 ResearchGate 链接，或保持 `#`。
5. 补充论文 PDF 链接；Code 链接已指向 `code/` 下的对应占位目录。
6. 核实专利编号、申请号、软著登记号和部分奖项会议名。
7. GitHub Pages 首次部署可能需要等待数分钟；如果页面未更新，请稍后刷新或清理浏览器缓存。

## 10. 部署记录

目标仓库：

```text
https://github.com/guuacel/guuacel.github.io.git
```

已创建远程仓库：

```text
guuacel/guuacel.github.io
```

已推送本地 `main` 分支：

```bash
git push -u origin main
```

GitHub Pages 地址：

```text
https://guuacel.github.io
```

远程页面访问检查：

```text
HTTP 200 OK
```

## 11. 结论

该目录已整理为可直接作为 GitHub Pages 仓库使用的静态站点版本。`index.html` 位于根目录，核心资源路径均为相对路径，`.nojekyll` 已创建，中英文切换功能由 `profile.json` 和 `main.js` 驱动。

