# 个人主页后台管理

这个后台是本地管理程序，用于维护 GitHub Pages 静态主页的数据文件。

## 启动

在仓库根目录运行：

```powershell
npm run admin
```

然后打开：

```text
http://127.0.0.1:8787
```

## 可以做什么

- 新增、编辑、删除 `论文实现` 条目。
- 为每个实现维护中英文标题、摘要、算法步骤。
- 导入 README 和代码文件，保存时同步写入 `code/` 目录。
- 点 `发布到 GitHub` 后执行：
  - `git add assets/data/profile.json code`
  - `git commit -m "..."`
  - `git push origin HEAD`

## 注意

- 这个后台只监听 `127.0.0.1`，用于本机操作，不是部署到 GitHub Pages 上的在线后台。
- GitHub Pages 是静态托管，不能直接运行后端服务。
- 发布前建议看左侧 Git 状态，确认只包含你想发布的改动。
