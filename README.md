# webRTC-share

A WebRTC-based screen sharing application built with Electron, Socket.io, and Simple-Peer.

## Features

- 🖥️ Real-time screen sharing using WebRTC
- 🚀 Electron desktop application
- 🔌 Socket.io signaling server
- 👥 Room-based connections
- 🎯 Share entire screens or individual windows
- 🌐 Browser-based viewer support

## Tech Stack

- **Electron** - Desktop application framework
- **WebRTC** - Peer-to-peer communication
- **Socket.io** - Real-time signaling
- **Simple-Peer** - WebRTC wrapper library
- **Node.js** - Server runtime

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aebayav/webRTC-share.git
cd webRTC-share
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running in Development Mode

Start both the signaling server and Electron app concurrently:

```bash
npm run dev
```

### Running Components Separately

Start the signaling server only:
```bash
npm run server
```

Start the Electron app only:
```bash
npm start
```

## Project Structure

```
webRTC-share/
├── app/
│   ├── config.json      # Application configuration
│   ├── index.html       # Electron app UI
│   ├── main.js          # Electron main process
│   └── renderer.js      # Electron renderer process
├── public/
│   └── index.html       # Web viewer interface
├── server/
│   └── server.js        # Socket.io signaling server
├── package.json
└── README.md
```

## How It Works

1. **Electron App** - Captures screen/window using desktopCapturer API
2. **Signaling Server** - Coordinates WebRTC peer connections via Socket.io
3. **WebRTC** - Establishes peer-to-peer connections for media streaming
4. **Viewer** - Receives and displays the shared screen in real-time

## Configuration

The signaling server runs on port 3000 by default. You can modify this in [server/server.js](server/server.js).

## License

ISC

## Author

[aebayav](https://github.com/aebayav)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
