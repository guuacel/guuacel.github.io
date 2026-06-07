# Customization Guide

本指南说明如何维护 `guuacel.github.io` 学术个人主页。站点内容主要由 `assets/data/profile.json` 驱动，页面结构位于 `index.html`，样式位于 `assets/css/style.css`，交互逻辑位于 `assets/js/main.js`。

## 1. 修改个人基本信息

打开：

```text
assets/data/profile.json
```

分别修改 `zh.hero` 和 `en.hero` 中的字段：

```json
{
  "name": "Chuanda Cai",
  "title": "博士研究生 | 信息安全与应用密码学",
  "affiliation": "武汉大学 | TODO: 补充学院或实验室",
  "bio": "TODO: 补充个人简介",
  "links": {
    "email": "ccddcc@whu.edu.cn",
    "github": "https://github.com/guuacel",
    "googleScholar": "https://scholar.google.com/citations?user=ZRjejGAAAAAJ&hl=zh-CN",
    "orcid": "https://orcid.org/0009-0007-0926-0465"
  }
}
```

中文和英文版本应保持结构一致，避免页面渲染时出现空字段。

## 2. 替换头像

1. 将头像图片放入 `assets/img/`。
2. 推荐使用正方形图片，例如 `avatar.jpg` 或 `avatar.png`。
3. 修改 `profile.json` 中的头像路径：

```json
"avatar": "assets/img/avatar.jpg"
```

路径必须是相对路径，不要使用 Windows 本机绝对路径或临时文件路径。

## 3. 修改研究方向

修改：

```text
zh.research.items
en.research.items
```

每个研究方向使用以下结构：

```json
{
  "title": "研究方向名称",
  "description": "研究方向说明",
  "keywords": ["关键词 1", "关键词 2"]
}
```

## 4. 更新成果

修改：

```text
zh.publications.papers
en.publications.papers
```

每篇论文结构如下：

```json
{
  "title": "Paper title",
  "authors": "Author A, Author B",
  "venue": "Journal or Conference",
  "year": "2025",
  "doi": "10.xxxx/xxxxx",
  "pdf": "#",
  "bibtex": "@article{...}"
}
```

说明：

- `doi` 只填写 DOI 字符串，页面会自动生成 `https://doi.org/...` 链接。
- 没有 PDF 时填写 `#`。
- `code` 填写对应论文代码目录的 GitHub 链接，例如 `https://github.com/guuacel/guuacel.github.io/tree/main/code/dwtat-dasis`。
- 没有 BibTeX 时填写空字符串 `""`。
- 不要在 JSON 中添加注释或尾随逗号。

## 5. 更新科研项目

修改：

```text
zh.projects.items
en.projects.items
```

结构：

```json
{
  "title": "项目名称",
  "period": "起止时间",
  "role": "个人角色",
  "description": "项目说明",
  "tech": ["Python", "Docker"],
  "link": "#"
}
```

## 6. 更新专利与软著

修改：

```text
zh.patents.items
en.patents.items
```

结构：

```json
{
  "name": "专利或软著名称",
  "type": "发明专利 / 软件著作权",
  "status": "已授权 / 审查中 / 已登记",
  "year": "2025",
  "note": "编号或备注"
}
```

## 7. 更新工具

修改：

```text
zh.tools.items
en.tools.items
```

结构：

```json
{
  "name": "工具名称",
  "description": "工具说明",
  "action": "按钮文字",
  "link": "https://github.com/guuacel/guuacel.github.io/tree/main/code",
  "icon": "code"
}
```

荣誉奖励数据已保留在 `awardsArchive` 中，但页面不再渲染该模块。

## 8. 更新论文实现

修改：

```text
zh.implementations.items
en.implementations.items
```

每个论文实现条目使用同一个 `id`，中英文内容分别写在 `zh` 和 `en` 下。主页面最多直接显示 8 个条目，超过 8 个后该区域会出现滚动条。点击条目会进入：

```text
paper_implementation.html?id=你的论文实现ID
```

结构：

```json
{
  "id": "paper-implementation-id",
  "title": "论文名称",
  "venue": "期刊名称",
  "year": 2026,
  "abstract": "摘要介绍",
  "algorithmSections": [
    {
      "title": "算法名称或阶段",
      "steps": [
        "步骤 1：说明核心输入、输出和初始化。",
        "步骤 2：说明算法主体流程。"
      ]
    }
  ],
  "code": {
    "language": "python",
    "content": "def algorithm():\n    pass"
  }
}
```

详情页导航只保留“返回主页”和语言切换按钮，正文包含摘要介绍、目录、算法详细步骤和算法代码。

## 9. 调整颜色和版式

打开：

```text
assets/css/style.css
```

修改 `:root` 中的变量：

```css
:root {
  --primary: #174b7a;
  --accent: #b7791f;
  --max: 1120px;
}
```

## 10. 本地调试

在仓库根目录运行：

```bash
python -m http.server 8000
```

访问：

```text
http://localhost:8000
```

## 11. 部署检查

部署前确认：

- `index.html` 位于仓库根目录；
- `.nojekyll` 位于仓库根目录；
- 所有本地资源使用相对路径；
- `assets/data/profile.json` 是合法 JSON；
- `assets/img/avatar-placeholder.png` 或你的真实头像存在；
- 没有 Windows 本地绝对路径；
- GitHub Pages 设置为 `main` 分支和 `/root` 目录。

