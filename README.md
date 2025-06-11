# 🧘 ZenPad

ZenPad is a minimalist, distraction-free writing application designed to help you focus and let your thoughts flow effortlessly. Built using React and Vite for blazing-fast performance and simplicity.

## 🚀 Features

- 🧘‍♂️ Clean, distraction-free UI with dark and light modes
- ✍️ Local storage using IndexedDB for your writing sessions
- ⌨️ Fullscreen writing experience
- 📄 Export to `.txt`
- ⏱️ Timed writing sessions
- 🔤 Beautiful typography with custom fonts
- 🧠 Built-in AI reflection on your writing (100% offline)
- 🔒 No internet connection required

## 💻 Technical Details

- **Built with**: React, Vite, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Storage**: Dexie.js (IndexedDB wrapper)
- **AI Model**: Xenova/qwen2.5-0.5b-instruct-iq4_nl (loaded and run locally)

## 🔧 Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourname/zenpad.git
cd zenpad

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```bash
zenpad/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Editor.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles/
│       └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 📦 Features in Progress

- Cloud sync (using Supabase/Firebase)
- GitHub/GDrive backup
- Prompt generator for daily writing
- Word/character counter
- Mobile support (PWA)

## 🙌 Contributing

Pull requests are welcome! If you want to contribute:

- Fork the repository
- Create a new branch (`git checkout -b feature/your-feature`)
- Commit your changes
- Push to your fork
- Open a PR

## 📜 License

MIT License. Feel free to fork, clone, and remix ZenPad.

## 💡 Inspiration

ZenPad is inspired by apps like [iA Writer](https://ia.net/writer) and [Bear](https://bear.app). The mission is simple: **Create a beautiful space to write freely**.

## 🧘 Stay Focused, Write Free.
