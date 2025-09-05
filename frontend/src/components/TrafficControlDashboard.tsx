import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimeDistanceGraph from './TimeDistanceGraph';
import TrackOccupancyGraph from './TrackOccupancyGraph';
import ControlPanel from './ControlPanel';
import './TrafficControlDashboard.css';

interface Train {
  id: string;
  position: number;
  section: string;
  status: string;
  delay: number;
}

interface SimulationState {
  current_time: string;
  trains: Train[];
}

interface SystemStatus {
  status: string;
  simulation_running: boolean;
  connected_clients: number;
}

interface Conflict {
  train1_id: string;
  train2_id: string;
  location: string;
  time: string;
  conflict_type: string;
}

interface Resolution {
  solution_type: string;
  details: any;
  cost: number;
}

const TrafficControlDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [currentConflict, setCurrentConflict] = useState<Conflict | null>(null);
  const [proposedResolution, setProposedResolution] = useState<Resolution | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Check connection and fetch initial status
    checkConnection();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      if (isConnected) {
        fetchSystemStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const checkConnection = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/status');
      setIsConnected(true);
      setSystemStatus(response.data);
    } catch (error) {
      setIsConnected(false);
      console.error('Connection failed:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/status');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const startSimulation = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/simulation/start');
      
      if (response.data.success) {
        setAlerts(prev => [...prev, 'Simulation started']);
        fetchSystemStatus();
        
        // Simulate disruption after 5 seconds
        setTimeout(() => {
          simulateDisruption();
        }, 5000);
      } else {
        setAlerts(prev => [...prev, `Error: ${response.data.error}`]);
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      setAlerts(prev => [...prev, 'Error starting simulation']);
    }
  };

  const simulateDisruption = () => {
    // Simulate a disruption and conflict detection
    const mockConflict: Conflict = {
      train1_id: 'T001',
      train2_id: 'T002',
      location: 'AB',
      time: new Date(Date.now() + 15 * 60000).toISOString(),
      conflict_type: 'head_on'
    };

    const mockResolution: Resolution = {
      solution_type: 'reroute',
      details: {
        rerouted_train: 'T002',
        from_track: 'main',
        to_track: 'loop',
        location: 'B',
        estimated_delay: 3
      },
      cost: 3
    };

    setAlerts(prev => [...prev, 'Disruption detected: Train T001 delayed by 10 minutes']);
    
    setTimeout(() => {
      setCurrentConflict(mockConflict);
      setProposedResolution(mockResolution);
      setAlerts(prev => [...prev, `Conflict detected between ${mockConflict.train1_id} and ${mockConflict.train2_id}`]);
      setAlerts(prev => [...prev, `AI Resolution: Reroute ${mockResolution.details.rerouted_train} to ${mockResolution.details.to_track} line`]);
    }, 2000);
  };

  const stopSimulation = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/simulation/stop');
      
      if (response.data.success) {
        setAlerts(prev => [...prev, 'Simulation stopped']);
        fetchSystemStatus();
        setCurrentConflict(null);
        setProposedResolution(null);
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const acceptResolution = async () => {
    if (!proposedResolution) return;

    try {
      const response = await axios.post('http://localhost:8000/api/resolution/accept', proposedResolution);
      
      if (response.data.success) {
        setCurrentConflict(null);
        setProposedResolution(null);
        setAlerts(prev => [...prev, 'Resolution accepted and applied']);
      }
    } catch (error) {
      console.error('Error accepting resolution:', error);
    }
  };

  const rejectResolution = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/resolution/reject');
      
      if (response.data.success) {
        setProposedResolution(null);
        setAlerts(prev => [...prev, 'Resolution rejected']);
      }
    } catch (error) {
      console.error('Error rejecting resolution:', error);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="traffic-control-dashboard">
      <header className="dashboard-header">
        <h1>AI-Powered Train Traffic Control</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-display">
          <div className="graph-container">
            <h2>Time-Distance Graph</h2>
            <TimeDistanceGraph 
              simulationState={simulationState}
              conflict={currentConflict}
              resolution={proposedResolution}
            />
          </div>
          
          <div className="track-container">
            <h2>Track Occupancy</h2>
            <TrackOccupancyGraph 
              simulationState={simulationState}
              resolution={proposedResolution}
            />
          </div>
        </div>

        <div className="control-sidebar">
          <ControlPanel
            systemStatus={systemStatus}
            alerts={alerts}
            currentConflict={currentConflict}
            proposedResolution={proposedResolution}
            onStartSimulation={startSimulation}
            onStopSimulation={stopSimulation}
            onAcceptResolution={acceptResolution}
            onRejectResolution={rejectResolution}
            onClearAlerts={clearAlerts}
          />
        </div>
      </div>
    </div>
  );
};

export default TrafficControlDashboard;
