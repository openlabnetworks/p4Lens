# P4Lens 🔍

**Interactive P4 Program Visualizer** - Upload and visualize P4 programs with an intuitive, interactive pipeline flow diagram.

> Crafted by [Sankalp Jha](https://sankalpjha.dev)

![P4Lens](https://img.shields.io/badge/P4-Visualization-blue)
![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-19.1-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)

## Features

- **Interactive Visualization**: Explore P4 program structure with an interactive flow diagram
- **Pipeline Analysis**: Visualize Parser, Ingress Control, Egress Control, and Deparser
- **Table & Action Inspection**: View match-action tables, keys, and associated actions
- **Header Definitions**: Inspect all header definitions and field specifications
- **Extern Objects**: See counters, meters, registers, and digest objects
- **Support for P4₁₄ and P4₁₆**: Works with both P4 language versions
- **Real-time Parsing**: Upload and parse P4 files instantly
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and React Flow

## Architecture

```
p4Lens/
├── backend/          # FastAPI backend for P4 parsing
│   ├── main.py       # API endpoints
│   ├── parser_utils.py  # P4 parsing logic
│   ├── Dockerfile    # Backend container
│   └── requirements.txt
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx   # Main application
│   │   └── components/ui/
│   │       ├── PipelineFlow.jsx  # ReactFlow visualization
│   │       ├── card.jsx
│   │       └── button.jsx
│   ├── Dockerfile    # Frontend container
│   └── package.json
└── docker-compose.yml
```

## Quick Start

### Option 1: Local Development

You can bootstrap everything with the helper script:

```bash
./start.sh             # local FastAPI + Vite dev servers
./start.sh docker      # production-like docker compose stack
./stop.sh              # stops either mode (auto-detects docker)
```

The script automatically installs dependencies, manages background processes, and cleans up containers so you don't get orphaned docker instances.

#### Prerequisites
- Python 3.11+
- Node.js 20+
- npm or yarn

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 📖 Usage

1. **Upload a P4 File**: Click on the upload area and select a `.p4` file
2. **Visualize**: The parser will extract the program structure and display it
3. **Explore**: Click on any node to see detailed information about:
   - Tables and their keys
   - Actions
   - Headers and field definitions
   - Extern objects
4. **Navigate**: Use the minimap and controls to navigate the pipeline
5. **Upload Another**: Click "Upload Another File" to analyze a different program

## 🔧 API Endpoints

### `GET /`
Health check endpoint

### `GET /health`
Returns API health status

### `POST /upload`
Upload and parse a P4 file

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (P4 file)

**Response:**
```json
{
  "filename": "example.p4",
  "structure": {
    "ParserName": {
      "type": "parser",
      "tables": [],
      "headers": [],
      "externs": [],
      ...
    },
    "_tables": {...},
    "_headers": {...},
    "_externs": [...],
    ...
  }
}
```
## Parser Capabilities

The P4 parser extracts:

- **Parser blocks**: Entry points and state machines
- **Control blocks**: Ingress/egress pipelines
- **Deparser blocks**: Packet reassembly
- **Tables**: Match-action tables with keys and actions
- **Headers**: Packet header definitions with fields and bit widths
- **Externs**: Counter, Meter, Register, Digest objects
- **Constants & Enums**: Named values

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## Known Issues & Future Work

- [ ] Support for more complex P4 constructs
- [ ] P4Runtime integration
- [ ] Export visualizations as images
- [ ] Multiple file analysis and comparison
- [ ] Integration with P4 debuggers
- [ ] Support for custom architectures beyond v1model

## Tips

- The parser works best with well-formatted P4 code
- For large programs, use the minimap to navigate
- Click on nodes to see detailed information


## Support

For issues, questions, or suggestions, please open an issue on GitHub or reach out via [sankalpjha.dev](https://sankalpjha.dev).

---

Built with ❤️ for the P4 community
