import logging
from typing import Dict, List, Tuple, Optional
import numpy as np
from datetime import datetime, timedelta
import random
import math

logger = logging.getLogger(__name__)

class Conflict:
    def __init__(self, train1_id: str, train2_id: str, location: str, time: datetime, conflict_type: str):
        self.train1_id = train1_id
        self.train2_id = train2_id
        self.location = location
        self.time = time
        self.conflict_type = conflict_type  # "head_on", "overtaking", "crossing"
        
    def __str__(self):
        return f"Conflict between {self.train1_id} and {self.train2_id} at {self.location} at {self.time}"

class Resolution:
    def __init__(self, conflict: Conflict, solution_type: str, details: Dict):
        self.conflict = conflict
        self.solution_type = solution_type  # "reroute", "delay", "priority_change"
        self.details = details
        self.cost = 0  # Total delay cost
        
class ConflictDetectionService:
    def __init__(self):
        self.prediction_horizon = 30  # minutes
        self.conflicts: List[Conflict] = []
        self.resolutions: List[Resolution] = []
        
    async def detect_conflicts(self, trains: Dict, network_data: Dict, current_time: datetime) -> List[Conflict]:
        """Detect potential conflicts between trains"""
        conflicts = []
        
        # Get predicted positions for all trains
        predictions = self.predict_train_positions(trains, current_time)
        
        # Check for conflicts between each pair of trains
        train_ids = list(trains.keys())
        for i in range(len(train_ids)):
            for j in range(i + 1, len(train_ids)):
                train1_id = train_ids[i]
                train2_id = train_ids[j]
                
                conflict = self.check_train_pair_conflict(
                    train1_id, train2_id, predictions, network_data, current_time
                )
                
                if conflict:
                    conflicts.append(conflict)
        
        self.conflicts = conflicts
        logger.info(f"Detected {len(conflicts)} potential conflicts")
        return conflicts
    
    def predict_train_positions(self, trains: Dict, current_time: datetime) -> Dict:
        """Predict future positions of all trains"""
        predictions = {}
        
        for train_id, train in trains.items():
            predictions[train_id] = self.predict_single_train_position(train, current_time)
        
        return predictions
    
    def predict_single_train_position(self, train, current_time: datetime) -> List[Tuple[str, datetime]]:
        """Predict future positions of a single train"""
        predictions = []
        
        # Simple prediction based on schedule and current delay
        for i, section in enumerate(train.route):
            if section in train.schedule:
                scheduled_arrival = datetime.strptime(train.schedule[section]["arrival"], "%H:%M")
                scheduled_arrival = scheduled_arrival.replace(
                    year=current_time.year,
                    month=current_time.month,
                    day=current_time.day
                )
                
                # Apply current delay
                predicted_arrival = scheduled_arrival + timedelta(minutes=train.delay)
                
                # Only include future positions
                if predicted_arrival > current_time:
                    predictions.append((section, predicted_arrival))
        
        return predictions
    
    def check_train_pair_conflict(self, train1_id: str, train2_id: str, predictions: Dict, 
                                network_data: Dict, current_time: datetime) -> Optional[Conflict]:
        """Check for conflicts between two specific trains"""
        train1_predictions = predictions.get(train1_id, [])
        train2_predictions = predictions.get(train2_id, [])
        
        # Check for overlapping single-track sections
        for section1, time1 in train1_predictions:
            for section2, time2 in train2_predictions:
                if section1 == section2:
                    # Check if this is a single-track section
                    section_info = self.get_section_info(section1, network_data)
                    if section_info and section_info.get("type") == "single_track":
                        # Check time overlap (assuming 5-minute occupancy)
                        time_diff = abs((time1 - time2).total_seconds() / 60)
                        if time_diff < 5:  # Conflict if within 5 minutes
                            return Conflict(
                                train1_id=train1_id,
                                train2_id=train2_id,
                                location=section1,
                                time=min(time1, time2),
                                conflict_type="head_on"
                            )
        
        return None
    
    def get_section_info(self, section_id: str, network_data: Dict) -> Optional[Dict]:
        """Get information about a network section"""
        for section in network_data.get("sections", []):
            if section["id"] == section_id:
                return section
        return None
    
    async def generate_resolution(self, conflict: Conflict, trains: Dict, network_data: Dict) -> Resolution:
        """Generate a resolution for a detected conflict using hybrid heuristic approach"""
        logger.info(f"Generating resolution for conflict: {conflict}")
        
        # Step 1: Constraint-Based Heuristic (CBH)
        initial_solution = self.constraint_based_heuristic(conflict, trains, network_data)
        
        # Step 2: Simulated Annealing (SA) refinement
        optimized_solution = self.simulated_annealing(initial_solution, conflict, trains, network_data)
        
        return optimized_solution
    
    def constraint_based_heuristic(self, conflict: Conflict, trains: Dict, network_data: Dict) -> Resolution:
        """Generate initial solution using constraint-based heuristic"""
        train1 = trains[conflict.train1_id]
        train2 = trains[conflict.train2_id]
        
        # Simple heuristic: prioritize the train that is scheduled to leave the block first
        if conflict.train1_id in train1.schedule and conflict.location in train1.schedule:
            train1_time = datetime.strptime(train1.schedule[conflict.location]["departure"], "%H:%M")
        else:
            train1_time = conflict.time
            
        if conflict.train2_id in train2.schedule and conflict.location in train2.schedule:
            train2_time = datetime.strptime(train2.schedule[conflict.location]["departure"], "%H:%M")
        else:
            train2_time = conflict.time
        
        # Determine which train to reroute or delay
        if train1_time <= train2_time:
            # Train1 has priority, delay/reroute train2
            delayed_train = conflict.train2_id
            priority_train = conflict.train1_id
        else:
            # Train2 has priority, delay/reroute train1
            delayed_train = conflict.train1_id
            priority_train = conflict.train2_id
        
        # Check if rerouting is possible (loop line available)
        section_info = self.get_section_info(conflict.location, network_data)
        if section_info and "loop" in section_info.get("tracks", []):
            # Reroute to loop line
            solution = Resolution(
                conflict=conflict,
                solution_type="reroute",
                details={
                    "rerouted_train": delayed_train,
                    "from_track": "main",
                    "to_track": "loop",
                    "location": conflict.location,
                    "estimated_delay": 2  # 2 minute delay for rerouting
                }
            )
            solution.cost = 2
        else:
            # Delay the train
            delay_minutes = 10  # Default delay
            solution = Resolution(
                conflict=conflict,
                solution_type="delay",
                details={
                    "delayed_train": delayed_train,
                    "delay_minutes": delay_minutes,
                    "location": conflict.location
                }
            )
            solution.cost = delay_minutes
        
        logger.info(f"CBH generated solution: {solution.solution_type} for train {solution.details.get('delayed_train', solution.details.get('rerouted_train'))}")
        return solution
    
    def simulated_annealing(self, initial_solution: Resolution, conflict: Conflict, 
                          trains: Dict, network_data: Dict) -> Resolution:
        """Optimize solution using Simulated Annealing"""
        current_solution = initial_solution
        best_solution = initial_solution
        
        # SA parameters
        initial_temp = 100.0
        final_temp = 1.0
        cooling_rate = 0.95
        max_iterations = 50
        
        temperature = initial_temp
        
        for iteration in range(max_iterations):
            # Generate neighbor solution
            neighbor = self.generate_neighbor_solution(current_solution, conflict, trains, network_data)
            
            # Calculate cost difference
            delta_cost = neighbor.cost - current_solution.cost
            
            # Accept or reject the neighbor
            if delta_cost < 0 or random.random() < math.exp(-delta_cost / temperature):
                current_solution = neighbor
                
                # Update best solution
                if neighbor.cost < best_solution.cost:
                    best_solution = neighbor
            
            # Cool down
            temperature *= cooling_rate
            
            if temperature < final_temp:
                break
        
        logger.info(f"SA optimized solution cost from {initial_solution.cost} to {best_solution.cost}")
        return best_solution
    
    def generate_neighbor_solution(self, current_solution: Resolution, conflict: Conflict,
                                 trains: Dict, network_data: Dict) -> Resolution:
        """Generate a neighbor solution for Simulated Annealing"""
        # Create a copy of current solution
        neighbor = Resolution(
            conflict=current_solution.conflict,
            solution_type=current_solution.solution_type,
            details=current_solution.details.copy()
        )
        
        if current_solution.solution_type == "delay":
            # Vary delay time
            current_delay = current_solution.details["delay_minutes"]
            new_delay = max(1, current_delay + random.randint(-3, 3))
            neighbor.details["delay_minutes"] = new_delay
            neighbor.cost = new_delay
            
        elif current_solution.solution_type == "reroute":
            # Vary estimated delay for rerouting
            current_delay = current_solution.details["estimated_delay"]
            new_delay = max(1, current_delay + random.randint(-1, 2))
            neighbor.details["estimated_delay"] = new_delay
            neighbor.cost = new_delay
        
        # Small chance to completely change solution type
        if random.random() < 0.1:
            section_info = self.get_section_info(conflict.location, network_data)
            if current_solution.solution_type == "delay" and section_info and "loop" in section_info.get("tracks", []):
                # Change from delay to reroute
                neighbor.solution_type = "reroute"
                neighbor.details = {
                    "rerouted_train": current_solution.details["delayed_train"],
                    "from_track": "main",
                    "to_track": "loop",
                    "location": conflict.location,
                    "estimated_delay": 2
                }
                neighbor.cost = 2
            elif current_solution.solution_type == "reroute":
                # Change from reroute to delay
                neighbor.solution_type = "delay"
                neighbor.details = {
                    "delayed_train": current_solution.details["rerouted_train"],
                    "delay_minutes": 8,
                    "location": conflict.location
                }
                neighbor.cost = 8
        
        return neighbor
    
    def calculate_solution_cost(self, solution: Resolution) -> float:
        """Calculate the total cost of a solution"""
        if solution.solution_type == "delay":
            return solution.details["delay_minutes"]
        elif solution.solution_type == "reroute":
            return solution.details["estimated_delay"]
        else:
            return 0
    
    async def validate_resolution(self, resolution: Resolution, trains: Dict) -> bool:
        """Validate that a resolution is feasible"""
        # Basic validation logic
        if resolution.solution_type == "delay":
            return resolution.details["delay_minutes"] > 0
        elif resolution.solution_type == "reroute":
            return resolution.details["estimated_delay"] >= 0
        
        return True
