# AI-Powered Train Traffic Control System

## Project Overview

This is a prototype implementation of an AI-powered train traffic control system designed for Smart India Hackathon 2025. The system demonstrates proactive conflict detection and resolution for railway traffic management.

## Features

- **Real-time Traffic Visualization**: Time-distance graphs and track occupancy displays
- **Conflict Detection**: Automatic detection of potential train conflicts
- **AI-Powered Resolution**: Intelligent resolution suggestions using hybrid algorithms
- **Interactive Dashboard**: Web-based control interface for traffic controllers
- **Simulation Environment**: Built-in simulation for demonstration purposes

## Architecture

### Backend (Python/FastAPI)
- **API Gateway**: FastAPI-based REST API with WebSocket support
- **Simulation Service**: Train movement simulation and disruption injection
- **Conflict Detection Service**: Rule-based conflict detection with AI resolution
- **Data**: JSON-based scenario files (network, timetable, disruptions)

### Frontend (React/TypeScript)
- **Dashboard**: Main control interface
- **Time-Distance Graph**: D3.js-powered visualization
- **Track Occupancy View**: Real-time track usage display
- **Control Panel**: System status and resolution controls

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 22+
- npm

### Installation

1. **Clone and Setup**:
   ```bash
   cd d:\Projects\SIH2025
   ```

2. **Backend Setup**:
   ```bash
   # Python environment is already configured
   # Dependencies are already installed
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   # Dependencies are already installed
   ```

### Running the Application

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   D:/Projects/SIH2025/.venv/Scripts/python.exe main.py
   ```
   Backend will be available at: http://localhost:8000

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   Frontend will be available at: http://localhost:3000

### Demo Workflow

1. **Access Dashboard**: Open http://localhost:3000 in your browser
2. **Start Simulation**: Click "Start Simulation" in the control panel
3. **Watch Demo**: 
   - System starts with planned train schedules
   - After 5 seconds, a disruption is injected (Train T001 delayed)
   - After 7 seconds, conflict is detected between T001 and T002
   - AI proposes resolution (reroute T002 to loop line)
4. **Controller Decision**: Accept or reject the AI's proposal
5. **Result**: See the impact on the visualization

## System Components

### Data Files (backend/data/)
- `network.json`: Railway network topology
- `timetable.json`: Train schedules and routes  
- `disruption.json`: Planned disruption scenarios

### API Endpoints
- `GET /api/status`: System status
- `POST /api/simulation/start`: Start simulation
- `POST /api/simulation/stop`: Stop simulation
- `POST /api/resolution/accept`: Accept AI resolution
- `POST /api/resolution/reject`: Reject AI resolution

### Visualization Features
- **Blue dotted lines**: Original planned train paths
- **Blue solid circles**: Current train positions
- **Red flashing circle**: Detected conflict location
- **Orange dashed lines**: Proposed resolution paths
- **Track blocks**: Station occupancy timelines

## Technical Implementation

### Conflict Detection Algorithm
- Rule-based detection for single-track conflicts
- Predictive analysis with 30-minute horizon
- Real-time conflict validation

### Resolution Algorithm (Hybrid Heuristic)
1. **Constraint-Based Heuristic (CBH)**: Generate initial feasible solution
2. **Simulated Annealing (SA)**: Optimize solution to minimize delays
3. **Cost-based evaluation**: Minimize total delay time

### Future Enhancements
- WebSocket integration for real-time updates
- SUMO integration for realistic train simulation
- Machine learning-based resolution algorithms
- Multi-section network support
- Advanced disruption scenarios

## Project Structure
```
SIH2025/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── services/
│   │   ├── simulation_service.py
│   │   ├── conflict_detection_service.py
│   │   └── websocket_manager.py
│   ├── data/
│   │   ├── network.json
│   │   ├── timetable.json
│   │   └── disruption.json
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrafficControlDashboard.tsx
│   │   │   ├── TimeDistanceGraph.tsx
│   │   │   ├── TrackOccupancyGraph.tsx
│   │   │   └── ControlPanel.tsx
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## Development Notes

This prototype demonstrates the core "Detect and Resolve" loop as specified in the project blueprint. The system successfully shows:

1. ✅ Planned schedule visualization
2. ✅ Real-time disruption simulation  
3. ✅ Proactive conflict prediction
4. ✅ AI-generated resolution proposals
5. ✅ Human controller decision interface

The implementation follows the 6-week development plan outlined in the project blueprint and provides a solid foundation for the full-scale railway traffic control system.

## License

Created for Smart India Hackathon 2025
