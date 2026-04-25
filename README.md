# HoloBoard

A real-time collaborative whiteboard application built with React and WebRTC. Draw, brainstorm, and collaborate seamlessly with peer-to-peer synchronization.

## Features

✨ **Drawing Tools**
- Pen, Highlighter, Eraser with precision stroke detection
- Shapes: Rectangle, Circle, Diamond, Line, Arrow
- Laser pointer with temporal decay effect
- Text support via sticky notes
- Selection tool for moving/organizing content

🤝 **Real-Time Collaboration**
- P2P collaboration via WebRTC (PeerJS)
- Share room ID to connect with others instantly
- Live cursor tracking of collaborators
- Automatic state synchronization across peers

🎨 **User Experience**
- Dark neon theme with glass morphism design
- Minimap with viewport indicator
- Zoom & Pan controls (scroll wheel, middle mouse)
- Keyboard shortcuts for all tools and operations
- Undo/Redo with 30-level history stack

💾 **Persistence & Export**
- Auto-save to browser localStorage
- PNG export of whiteboard content
- State restoration on page reload

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5174)
npm run dev

# Build for production
npm run build
```

## How to Use

1. **Start Drawing**: Select a tool from the toolbar and draw on the canvas
2. **Collaborate**: Click "Share Room" to get a room ID, share it with others
3. **Connect**: Others can paste the room ID to join your session
4. **Organize**: Use selection tool to move content around
5. **Export**: Download your work as PNG

## Keyboard Shortcuts

- **P**: Pen | **H**: Highlighter | **E**: Eraser
- **R**: Rectangle | **C**: Circle | **D**: Diamond
- **L**: Line | **A**: Arrow | **LA**: Laser
- **S**: Select | **G**: Grab/Pan | **N**: Sticky Note
- **Ctrl+Z**: Undo | **Ctrl+Y**: Redo
- **Delete**: Remove selection | **Ctrl+A**: Select all
- **Ctrl+Shift+E**: Export PNG | **Ctrl+Shift+C**: Clear all

## Technology Stack

- **Frontend**: React 18 + Vite
- **Real-Time Sync**: PeerJS (WebRTC)
- **Canvas**: HTML5 Canvas 2D with custom rendering engine
- **State Management**: React hooks + localStorage
- **Styling**: CSS-in-JS with glass morphism UI

## Project Structure

```
src/
├── app/
│   └── WhiteboardPage.jsx    # Main application component
├── components/
├── constants/
├── context/
├── hooks/
├── services/
├── types/
└── utils/
```

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.
