import React from 'react';
import './ControlPanel.css';

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

interface Props {
  systemStatus: SystemStatus | null;
  alerts: string[];
  currentConflict: Conflict | null;
  proposedResolution: Resolution | null;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onAcceptResolution: () => void;
  onRejectResolution: () => void;
  onClearAlerts: () => void;
}

const ControlPanel: React.FC<Props> = ({
  systemStatus,
  alerts,
  currentConflict,
  proposedResolution,
  onStartSimulation,
  onStopSimulation,
  onAcceptResolution,
  onRejectResolution,
  onClearAlerts
}) => {
  const formatResolutionText = (resolution: Resolution): string => {
    if (resolution.solution_type === "reroute") {
      return `Reroute train ${resolution.details.rerouted_train} from ${resolution.details.from_track} to ${resolution.details.to_track} line at ${resolution.details.location}. Estimated delay: ${resolution.details.estimated_delay} minutes.`;
    } else if (resolution.solution_type === "delay") {
      return `Delay train ${resolution.details.delayed_train} by ${resolution.details.delay_minutes} minutes at ${resolution.details.location}.`;
    }
    return `Apply ${resolution.solution_type} solution.`;
  };

  return (
    <div className="control-panel">
      {/* System Status */}
      <div className="status-section">
        <h3>System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Connection:</span>
            <span className={`status-value ${systemStatus?.status === 'online' ? 'online' : 'offline'}`}>
              {systemStatus?.status || 'Unknown'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Simulation:</span>
            <span className={`status-value ${systemStatus?.simulation_running ? 'running' : 'stopped'}`}>
              {systemStatus?.simulation_running ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Clients:</span>
            <span className="status-value">{systemStatus?.connected_clients || 0}</span>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="controls-section">
        <h3>Simulation Controls</h3>
        <div className="button-group">
          <button 
            onClick={onStartSimulation}
            disabled={systemStatus?.simulation_running}
            className="btn btn-primary"
          >
            Start Simulation
          </button>
          <button 
            onClick={onStopSimulation}
            disabled={!systemStatus?.simulation_running}
            className="btn btn-secondary"
          >
            Stop Simulation
          </button>
        </div>
      </div>

      {/* Conflict Information */}
      {currentConflict && (
        <div className="conflict-section">
          <h3>⚠️ Conflict Detected</h3>
          <div className="conflict-details">
            <p><strong>Type:</strong> {currentConflict.conflict_type}</p>
            <p><strong>Trains:</strong> {currentConflict.train1_id} & {currentConflict.train2_id}</p>
            <p><strong>Location:</strong> {currentConflict.location}</p>
            <p><strong>Time:</strong> {new Date(currentConflict.time).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {proposedResolution && (
        <div className="resolution-section">
          <h3>🤖 AI Recommendation</h3>
          <div className="resolution-details">
            <p className="resolution-text">
              {formatResolutionText(proposedResolution)}
            </p>
            <p className="resolution-cost">
              <strong>Total Delay Cost:</strong> {proposedResolution.cost} minutes
            </p>
          </div>
          <div className="resolution-actions">
            <button 
              onClick={onAcceptResolution}
              className="btn btn-success"
            >
              Accept Plan
            </button>
            <button 
              onClick={onRejectResolution}
              className="btn btn-danger"
            >
              Reject Plan
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="alerts-section">
        <div className="alerts-header">
          <h3>Alerts</h3>
          {alerts.length > 0 && (
            <button 
              onClick={onClearAlerts}
              className="btn btn-sm btn-outline"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <p className="no-alerts">No alerts</p>
          ) : (
            alerts.slice(-5).reverse().map((alert, index) => (
              <div key={index} className="alert-item">
                <span className="alert-time">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="alert-message">{alert}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
