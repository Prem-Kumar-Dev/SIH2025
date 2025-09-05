import json
import asyncio
import logging
from typing import Dict, List, Optional
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class Train:
    def __init__(self, train_id: str, route: List[str], schedule: Dict):
        self.id = train_id
        self.route = route
        self.schedule = schedule
        self.current_position = 0
        self.current_section = route[0] if route else None
        self.delay = 0
        self.status = "scheduled"  # scheduled, running, delayed, completed
        
    def update_position(self, new_position: int, current_time: datetime):
        self.current_position = new_position
        if new_position < len(self.route):
            self.current_section = self.route[new_position]
        else:
            self.status = "completed"

class SimulationService:
    def __init__(self):
        self.trains: Dict[str, Train] = {}
        self.network_data = {}
        self.timetable_data = {}
        self.disruption_data = {}
        self.current_time = datetime.now()
        self.simulation_running = False
        self.simulation_speed = 1  # 1x real time
        self.websocket_manager = None
        
    async def initialize(self):
        """Initialize simulation with data files"""
        try:
            await self.load_scenario_data()
            await self.setup_trains()
            logger.info("Simulation service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing simulation: {e}")
            raise

    async def load_scenario_data(self):
        """Load network, timetable, and disruption data"""
        try:
            # Load network data
            with open("data/network.json", "r") as f:
                self.network_data = json.load(f)
            
            # Load timetable data
            with open("data/timetable.json", "r") as f:
                self.timetable_data = json.load(f)
            
            # Load disruption data
            with open("data/disruption.json", "r") as f:
                self.disruption_data = json.load(f)
                
            logger.info("Scenario data loaded successfully")
        except FileNotFoundError as e:
            logger.warning(f"Data file not found: {e}")
            # Create default data if files don't exist
            await self.create_default_scenario()
        except Exception as e:
            logger.error(f"Error loading scenario data: {e}")
            raise

    async def create_default_scenario(self):
        """Create default scenario data"""
        # Default network with simple single track and loop
        self.network_data = {
            "sections": [
                {"id": "A", "name": "Station A", "type": "station", "tracks": ["main", "loop"]},
                {"id": "AB", "name": "Section A-B", "type": "single_track", "tracks": ["main"]},
                {"id": "B", "name": "Station B", "type": "station", "tracks": ["main", "loop"]},
                {"id": "BC", "name": "Section B-C", "type": "single_track", "tracks": ["main"]},
                {"id": "C", "name": "Station C", "type": "station", "tracks": ["main", "loop"]}
            ],
            "distances": {
                "A-AB": 0, "AB-B": 10, "B-BC": 15, "BC-C": 25
            }
        }
        
        # Default timetable
        self.timetable_data = {
            "trains": [
                {
                    "id": "T001",
                    "route": ["A", "AB", "B", "BC", "C"],
                    "schedule": {
                        "A": {"arrival": "09:00", "departure": "09:05"},
                        "AB": {"arrival": "09:15", "departure": "09:15"},
                        "B": {"arrival": "09:25", "departure": "09:30"},
                        "BC": {"arrival": "09:40", "departure": "09:40"},
                        "C": {"arrival": "09:50", "departure": "09:55"}
                    }
                },
                {
                    "id": "T002",
                    "route": ["C", "BC", "B", "AB", "A"],
                    "schedule": {
                        "C": {"arrival": "09:10", "departure": "09:15"},
                        "BC": {"arrival": "09:25", "departure": "09:25"},
                        "B": {"arrival": "09:35", "departure": "09:40"},
                        "AB": {"arrival": "09:50", "departure": "09:50"},
                        "A": {"arrival": "10:00", "departure": "10:05"}
                    }
                }
            ]
        }
        
        # Default disruption - delay Train T001 by 10 minutes
        self.disruption_data = {
            "disruptions": [
                {
                    "id": "D001",
                    "type": "delay",
                    "train_id": "T001",
                    "location": "A",
                    "delay_minutes": 10,
                    "inject_at": "09:05"
                }
            ]
        }
        
        logger.info("Created default scenario data")

    async def setup_trains(self):
        """Initialize train objects from timetable"""
        for train_data in self.timetable_data.get("trains", []):
            train = Train(
                train_id=train_data["id"],
                route=train_data["route"],
                schedule=train_data["schedule"]
            )
            self.trains[train.id] = train
        
        logger.info(f"Initialized {len(self.trains)} trains")

    async def start_simulation(self):
        """Start the simulation loop"""
        if self.simulation_running:
            return {"message": "Simulation already running"}
        
        self.simulation_running = True
        self.current_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
        
        # Start the simulation loop
        asyncio.create_task(self.simulation_loop())
        
        return {
            "message": "Simulation started",
            "start_time": self.current_time.isoformat(),
            "trains": [{"id": t.id, "route": t.route} for t in self.trains.values()]
        }

    async def stop_simulation(self):
        """Stop the simulation"""
        self.simulation_running = False
        logger.info("Simulation stopped")

    async def simulation_loop(self):
        """Main simulation loop"""
        logger.info("Starting simulation loop")
        
        while self.simulation_running:
            try:
                # Update simulation time
                self.current_time += timedelta(minutes=1)
                
                # Update train positions
                await self.update_train_positions()
                
                # Check for disruptions
                await self.check_disruptions()
                
                # Broadcast updates via WebSocket
                if self.websocket_manager:
                    await self.broadcast_simulation_state()
                
                # Sleep for simulation speed (1 second = 1 minute in simulation)
                await asyncio.sleep(1.0 / self.simulation_speed)
                
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                break
        
        logger.info("Simulation loop ended")

    async def update_train_positions(self):
        """Update positions of all trains"""
        for train in self.trains.values():
            if train.status == "running":
                # Simple position update logic
                # In a real implementation, this would use SUMO or another simulator
                current_time_str = self.current_time.strftime("%H:%M")
                
                # Check if train should be at next station
                for i, section in enumerate(train.route):
                    if section in train.schedule:
                        scheduled_time = train.schedule[section]["arrival"]
                        if current_time_str >= scheduled_time and train.current_position <= i:
                            train.update_position(i, self.current_time)
                            break

    async def check_disruptions(self):
        """Check and apply scheduled disruptions"""
        current_time_str = self.current_time.strftime("%H:%M")
        
        for disruption in self.disruption_data.get("disruptions", []):
            if disruption["inject_at"] == current_time_str:
                await self.apply_disruption(disruption)

    async def apply_disruption(self, disruption: Dict):
        """Apply a disruption to the simulation"""
        train_id = disruption["train_id"]
        if train_id in self.trains:
            train = self.trains[train_id]
            train.delay += disruption["delay_minutes"]
            train.status = "delayed"
            
            logger.info(f"Applied disruption: {disruption['type']} to train {train_id}")
            
            # Trigger conflict detection
            if self.websocket_manager:
                await self.websocket_manager.broadcast({
                    "type": "disruption_detected",
                    "data": {
                        "train_id": train_id,
                        "disruption": disruption,
                        "current_time": self.current_time.isoformat()
                    }
                })

    async def broadcast_simulation_state(self):
        """Broadcast current simulation state"""
        if not self.websocket_manager:
            return
        
        state = {
            "type": "simulation_update",
            "data": {
                "current_time": self.current_time.isoformat(),
                "trains": [
                    {
                        "id": train.id,
                        "position": train.current_position,
                        "section": train.current_section,
                        "status": train.status,
                        "delay": train.delay
                    }
                    for train in self.trains.values()
                ]
            }
        }
        
        await self.websocket_manager.broadcast(state)

    def is_running(self):
        """Check if simulation is running"""
        return self.simulation_running

    async def apply_resolution(self, resolution_data: dict):
        """Apply the accepted resolution to the simulation"""
        # Implementation for applying AI-generated resolution
        logger.info(f"Applying resolution: {resolution_data}")
        return {"message": "Resolution applied successfully"}

    async def cleanup(self):
        """Cleanup simulation resources"""
        self.simulation_running = False
        logger.info("Simulation service cleaned up")

    def set_websocket_manager(self, manager):
        """Set the WebSocket manager for broadcasting updates"""
        self.websocket_manager = manager
