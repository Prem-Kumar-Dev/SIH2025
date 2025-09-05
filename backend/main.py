from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import asyncio
from typing import Dict, List
import logging
from services.simulation_service import SimulationService
from services.conflict_detection_service import ConflictDetectionService
from services.websocket_manager import WebSocketManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI-Powered Train Traffic Control", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
websocket_manager = WebSocketManager()
simulation_service = SimulationService()
conflict_service = ConflictDetectionService()

# Connect services
simulation_service.set_websocket_manager(websocket_manager)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting AI-Powered Train Traffic Control API")
    await simulation_service.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down services")
    await simulation_service.cleanup()

@app.get("/")
async def root():
    return {"message": "AI-Powered Train Traffic Control API is running"}

@app.get("/api/status")
async def get_status():
    """Get system status"""
    return {
        "status": "online",
        "simulation_running": simulation_service.is_running(),
        "connected_clients": len(websocket_manager.active_connections)
    }

@app.post("/api/simulation/start")
async def start_simulation():
    """Start the simulation"""
    try:
        result = await simulation_service.start_simulation()
        return {"success": True, "message": "Simulation started", "data": result}
    except Exception as e:
        logger.error(f"Error starting simulation: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/simulation/stop")
async def stop_simulation():
    """Stop the simulation"""
    try:
        await simulation_service.stop_simulation()
        return {"success": True, "message": "Simulation stopped"}
    except Exception as e:
        logger.error(f"Error stopping simulation: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/resolution/accept")
async def accept_resolution(resolution_data: dict):
    """Accept the AI's proposed resolution"""
    try:
        result = await simulation_service.apply_resolution(resolution_data)
        await websocket_manager.broadcast({
            "type": "resolution_accepted",
            "data": result
        })
        return {"success": True, "message": "Resolution accepted and applied"}
    except Exception as e:
        logger.error(f"Error accepting resolution: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/resolution/reject")
async def reject_resolution():
    """Reject the AI's proposed resolution"""
    try:
        await websocket_manager.broadcast({
            "type": "resolution_rejected",
            "data": {"message": "Resolution rejected by controller"}
        })
        return {"success": True, "message": "Resolution rejected"}
    except Exception as e:
        logger.error(f"Error rejecting resolution: {e}")
        return {"success": False, "error": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "request_status":
                status = await get_status()
                await websocket.send_text(json.dumps({
                    "type": "status_update",
                    "data": status
                }))
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        websocket_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
