# TTS Voice Library

阿里云百炼 Qwen Audio 3.0 TTS 预置音色库的在线浏览与试听工具。

收录 flash 与 plus 两个模型系列共 1194 条预置音色，支持多维筛选、在线试听和一键复制 voice 参数，方便在 [astrbot_plugin_tts_enhancer](https://github.com/sch-chun/astrbot_plugin_tts_enhancer) 等项目中快速选配音色。

## 在线访问

**[qwenaudio.tairitsu.work](https://qwenaudio.tairitsu.work)**

## 功能特性

- **多维筛选**：按关键词搜索、性别、语种、年龄范围筛选，特质与适用场景支持「包含 / 排除」双模式
- **在线试听**：直接播放预览音频，支持音量调节且设置自动持久化
- **一键复制**：复制 voice 参数到剪贴板，粘贴到插件配置即可使用
- **虚拟滚动**：基于 `@tanstack/react-virtual`，1194 条数据滚动丝滑不卡顿
- **深色 / 浅色主题**：一键切换，通过 CSS 变量统一管理
- **双系列切换**：flash / plus 模型系列选项卡，独立筛选状态

## 技术栈

- React 18 + Vite 5
- @tanstack/react-virtual（虚拟滚动）
- Bootstrap 5 + Font Awesome（样式与图标）

## 本地开发

```bash
npm install
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本到 dist/
npm run preview  # 预览构建产物
```

## 数据结构

音色数据存储在 `public/voices.json`，按模型系列分为 `flash` 和 `plus` 两个数组：

```json
{
  "flash": [
    {
      "序号": "1",
      "名称": "龙璨竹月",
      "voice参数": "qwen-audio-3.0-tts-flash-longcanzhuyue",
      "性别": "女",
      "年龄": "26",
      "特质": "平实质朴音",
      "适用场景": "日常对话",
      "语种": "中文",
      "预览音频文件名": "longcanzhuyue.wav"
    }
  ],
  "plus": [...]
}
```

## 项目结构

```
tts-voice-library/
├── public/
│   └── voices.json              # 音色数据
├── src/
│   ├── components/
│   │   ├── Header.jsx           # 顶栏 + 主题切换
│   │   ├── FilterBar.jsx        # 筛选栏（搜索/性别/语种/年龄/特质+场景）
│   │   ├── VoiceTable.jsx       # 表格容器（过滤/排序/虚拟滚动）
│   │   ├── VoiceRow.jsx         # 单行（播放/复制/排除）
│   │   ├── StatsBar.jsx         # 统计筛选结果数
│   │   └── Toast.jsx            # 全局提示
│   ├── context/
│   │   └── ThemeContext.jsx     # 主题状态管理
│   ├── App.jsx                  # 应用入口
│   ├── App.css                  # 全局样式
│   └── main.jsx
├── vite.config.js
└── package.json
```

## 关联项目

- [astrbot_plugin_tts_enhancer](https://github.com/sch-chun/astrbot_plugin_tts_enhancer) — 多供应商智能 TTS 插件，本库的音色可直接填入其配置使用

## License

MIT
