# Frontend/UI Design Document: AI Traffic Control Prototype

## 1. Guiding Principles

The prototype's UI is not just a display; it's a **Decision Support Tool**. Its primary goal is to empower the human controller by making the AI's analysis transparent and actionable. The design will adhere to key principles of "control-aware UX" for safety-critical systems:

### Core Design Principles

- **Clarity**: The system must clearly visualize what is happening, what is predicted to happen, and what the AI is proposing to do.
- **Proactivity**: The interface must shift the controller's focus from reacting to past events to proactively managing the future. It will provide an overview of the expected train process for the next 20-30 minutes.
- **Transparency**: The controller must understand why the AI is making a recommendation. The UI will present the "what" and the "why" of every suggestion.
- **User Agency**: The controller must always have the final say. The interface will provide clear, unambiguous controls to accept or reject AI suggestions, ensuring the human remains in the loop.

## 2. Screen Layout and Core Components

The UI will be a single-screen dashboard divided into three main sections. This unified interface integrates all decision-relevant information, preventing the need to switch between multiple systems.

### 2.1. Main View: The Time-Distance Graph

This is the central and most important component of the UI. It provides an at-a-glance overview of the entire control section over time.

#### Graph Structure
- **Axes**: The horizontal axis represents Distance (showing stations and key track points), and the vertical axis represents Time (scrolling from present to future).
- **Train Paths**: Each train is represented by a line on the graph. A consistent visual language is crucial:
  - **Solid Line**: The train's actual, historical path up to the present moment.
  - **Dotted Line**: The train's original, planned path according to the initial timetable.
  - **Dashed Line**: A proposed new path suggested by the AI to resolve a conflict.

#### Interactive Features
- **Conflict Highlighting**: Potential future conflicts detected by the AI will be explicitly highlighted on the graph with a prominent, unmissable visual marker (e.g., a flashing red circle).
- **Interactivity** (for prototype): The user can hover over any train line to see a tooltip with its ID, current status (e.g., "On Time," "Delayed 5 min"), and next stop.

### 2.2. Station View: Track Occupancy Graph

Located to the side of the main view, this panel provides a detailed look at resource utilization within stations, which is a common source of conflicts.

#### Structure
- **Station Timelines**: For each station in the control section, there will be a dedicated timeline. Each timeline will have horizontal bars representing the available platform tracks (e.g., Mainline, Loop Line 1).
- **Occupancy Blocks**: Colored blocks will be placed on these timelines to show when a track is scheduled to be occupied by a train.
  - **Blue Block**: Original scheduled occupancy.
  - **Orange Block**: A proposed new occupancy schedule from the AI.

#### Function
This view makes it immediately obvious if a proposed solution involves rerouting a train to a different platform or holding it at a station.

### 2.3. Control & Information Panel

This panel serves as the communication and action hub between the user and the system.

#### Components
- **System Status**: A simple indicator showing the system is "Online" and the current simulation time.
- **Alerts & Notifications**: This is where text-based alerts for detected conflicts will appear (e.g., "Conflict Detected: Train A / Train B").
- **AI Recommendations**: When the AI generates a solution, this section will display a clear, concise summary of the proposed action (e.g., "PROPOSED PLAN: Reroute Train A to Loop Line at Station Y. Hold for 4 minutes.").
- **Action Buttons**: Large, clear buttons for user decision-making:
  - **ACCEPT PLAN** button
  - **REJECT PLAN** button
  - These buttons will be disabled until the AI proposes a solution.

## 3. Step-by-Step UI Workflow for Prototype Scenario

This details what the user will see and do during the prototype demonstration.

### Step 1: Initial State
**What the User Sees**: The dashboard loads with the pre-defined scenario. The Time-Distance Graph shows solid lines for the trains' brief history and dotted lines for their future scheduled paths. All paths are conflict-free. The Track Occupancy Graph shows the planned platform usage. The Control Panel shows "System Status: Normal."

### Step 2: Visualizing a Disruption
**What the User Sees**: As the simulation runs, the solid line for "Train A" begins to lag behind its dotted planned path. A status indicator next to the train's ID might turn yellow and read "Delayed 2 min." The visual gap between the actual and planned path grows, providing immediate situational awareness of the delay.

### Step 3: Highlighting a Predicted Conflict
**What the User Sees**: The backend AI predicts that the delayed Train A will now conflict with Train B. Instantly, the UI reacts:
- On the Time-Distance Graph, a flashing red circle appears at the future time and location where the two trains' predicted paths will illegally intersect.
- The Control Panel displays a new alert in red: "CONFLICT DETECTED: Head-on conflict predicted for Train A and Train B in 18 minutes at Section X."

### Step 4: Presenting the AI's Solution
**What the User Sees**: After a few seconds, the UI updates to display the AI's proposed solution.
- On the Time-Distance Graph, new dashed lines appear for Train A and Train B, showing the new conflict-free paths. For example, Train A's dashed line now shows it stopping at a station siding, while Train B's dashed line continues on the mainline.
- The Track Occupancy Graph updates with an orange block, showing the new proposed use of the station's loop line for Train A.
- The Control Panel updates with the recommendation: "SOLUTION PROPOSED: Reroute Train A to Loop Line at Station Y. Hold for 4 minutes. This resolves the conflict with an estimated total delay of 5 minutes." The **ACCEPT PLAN** and **REJECT PLAN** buttons become active.

### Step 5: User Decision and Implementation
**What the User Does**: The user assesses the visual plan and the text summary and clicks **ACCEPT PLAN**.

**What the User Sees**: The UI provides immediate feedback:
- The dashed "proposed" lines on the Time-Distance Graph turn into the new dotted "planned" lines.
- The red conflict marker disappears.
- The alert in the Control Panel is replaced with a confirmation: "New plan implemented."
- The simulation continues, with the trains now following the newly adopted schedule. The solid lines will track along the new dotted paths.

## 4. Technical Implementation Guidelines

### 4.1. Color Coding Standards
- **Blue**: Original/planned schedules and occupancy
- **Green**: Normal operations, accepted plans
- **Yellow**: Warnings, minor delays
- **Orange**: AI proposed changes
- **Red**: Conflicts, critical alerts
- **Gray**: Historical/past events

### 4.2. Responsive Design Considerations
- The dashboard must be optimized for large control room displays
- Minimum resolution support: 1920x1080
- Text must be readable from 3-4 feet away
- Critical alerts must be visible in peripheral vision

### 4.3. Accessibility Requirements
- High contrast mode support
- Keyboard navigation for all interactive elements
- Screen reader compatibility for status announcements
- Color-blind friendly palette with pattern/texture alternatives

### 4.4. Performance Requirements
- Real-time updates (< 100ms latency for critical alerts)
- Smooth animations for state transitions
- Efficient rendering for 20-30 minute time horizons
- Graceful degradation under high system load

## 5. Component Architecture

### 5.1. Main Components
- `TrafficControlDashboard.tsx` - Main container component
- `TimeDistanceGraph.tsx` - Primary visualization component
- `TrackOccupancyGraph.tsx` - Station resource visualization
- `ControlPanel.tsx` - User interaction and status display
- `ConflictAlert.tsx` - Conflict notification component
- `AIRecommendation.tsx` - Solution proposal display

### 5.2. Data Flow
1. WebSocket connection for real-time updates
2. Redux/Context for state management
3. D3.js for complex visualizations
4. React hooks for component lifecycle management

### 5.3. Integration Points
- Backend API endpoints for simulation control
- WebSocket for real-time data streaming
- Configuration management for different railway networks
- Logging and audit trail for all user decisions

## 6. Testing and Validation

### 6.1. Usability Testing
- Task completion time measurement
- Error rate tracking during conflict resolution
- User satisfaction surveys
- Expert validation by railway traffic controllers

### 6.2. Performance Testing
- Real-time update responsiveness
- Memory usage under extended operation
- Browser compatibility testing
- Network latency simulation

### 6.3. Safety-Critical Validation
- Conflict detection accuracy verification
- UI state consistency validation
- Fail-safe behavior testing
- Emergency override functionality

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: After prototype validation  
**Stakeholders**: SIH 2025 Team, Railway Domain Experts, UI/UX Specialists
