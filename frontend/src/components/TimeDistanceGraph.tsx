import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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
  simulationState: SimulationState | null;
  conflict: Conflict | null;
  resolution: Resolution | null;
}

const TimeDistanceGraph: React.FC<Props> = ({ simulationState, conflict, resolution }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const stations = ["A", "AB", "B", "BC", "C"];
    const stationScale = d3.scalePoint()
      .domain(stations)
      .range([0, width])
      .padding(0.1);

    // Time scale (9:00 AM to 11:00 AM)
    const timeExtent = [
      new Date(2025, 8, 5, 9, 0), // 9:00 AM
      new Date(2025, 8, 5, 11, 0)  // 11:00 AM
    ];
    const timeScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, height]);

    // Create axes
    const xAxis = d3.axisBottom(stationScale);
    const yAxis = d3.axisLeft(timeScale)
      .tickFormat((d) => d3.timeFormat("%H:%M")(d as Date));

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis as any);

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis as any);

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Time");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Stations");

    // Draw planned train paths (dotted lines)
    const plannedPaths = [
      {
        id: "T001",
        path: [
          { station: "A", time: new Date(2025, 8, 5, 9, 5) },
          { station: "AB", time: new Date(2025, 8, 5, 9, 15) },
          { station: "B", time: new Date(2025, 8, 5, 9, 30) },
          { station: "BC", time: new Date(2025, 8, 5, 9, 40) },
          { station: "C", time: new Date(2025, 8, 5, 9, 55) }
        ],
        color: "#3b82f6"
      },
      {
        id: "T002",
        path: [
          { station: "C", time: new Date(2025, 8, 5, 9, 15) },
          { station: "BC", time: new Date(2025, 8, 5, 9, 25) },
          { station: "B", time: new Date(2025, 8, 5, 9, 40) },
          { station: "AB", time: new Date(2025, 8, 5, 9, 50) },
          { station: "A", time: new Date(2025, 8, 5, 10, 5) }
        ],
        color: "#ef4444"
      }
    ];

    const line = d3.line<{ station: string; time: Date }>()
      .x(d => stationScale(d.station)!)
      .y(d => timeScale(d.time))
      .curve(d3.curveLinear);

    // Draw planned paths
    plannedPaths.forEach(trainPath => {
      g.append("path")
        .datum(trainPath.path)
        .attr("class", "planned-path")
        .attr("d", line)
        .style("stroke", trainPath.color)
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5")
        .style("fill", "none");

      // Add train label
      const firstPoint = trainPath.path[0];
      g.append("text")
        .attr("x", stationScale(firstPoint.station)! - 10)
        .attr("y", timeScale(firstPoint.time) - 5)
        .style("font-size", "12px")
        .style("fill", trainPath.color)
        .text(trainPath.id);
    });

    // Draw actual train positions (solid lines)
    if (simulationState) {
      simulationState.trains.forEach(train => {
        const trainPath = plannedPaths.find(p => p.id === train.id);
        if (trainPath) {
          // Show current position as a circle
          const currentStation = train.section;
          const x = stationScale(currentStation);
          const currentTime = new Date(simulationState.current_time);
          const y = timeScale(currentTime);

          if (x !== undefined) {
            g.append("circle")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", 6)
              .style("fill", trainPath.color)
              .style("stroke", "#fff")
              .style("stroke-width", 2);

            // Add status indicator
            g.append("text")
              .attr("x", x + 10)
              .attr("y", y + 5)
              .style("font-size", "10px")
              .style("fill", train.status === "delayed" ? "#ef4444" : "#22c55e")
              .text(train.status);
          }
        }
      });
    }

    // Highlight conflict location
    if (conflict) {
      const conflictX = stationScale(conflict.location);
      const conflictTime = new Date(conflict.time);
      const conflictY = timeScale(conflictTime);

      if (conflictX !== undefined) {
        // Flashing red circle for conflict
        const conflictMarker = g.append("circle")
          .attr("cx", conflictX)
          .attr("cy", conflictY)
          .attr("r", 12)
          .style("fill", "none")
          .style("stroke", "#ef4444")
          .style("stroke-width", 3);

        // Add flashing animation
        conflictMarker
          .transition()
          .duration(500)
          .style("opacity", 0.3)
          .transition()
          .duration(500)
          .style("opacity", 1)
          .on("end", function repeat() {
            d3.select(this)
              .transition()
              .duration(500)
              .style("opacity", 0.3)
              .transition()
              .duration(500)
              .style("opacity", 1)
              .on("end", repeat);
          });

        g.append("text")
          .attr("x", conflictX)
          .attr("y", conflictY - 20)
          .style("font-size", "12px")
          .style("fill", "#ef4444")
          .style("font-weight", "bold")
          .style("text-anchor", "middle")
          .text("CONFLICT");
      }
    }

    // Show proposed resolution path
    if (resolution && resolution.solution_type === "reroute") {
      // Draw dashed line for proposed alternative path
      const proposedPath = plannedPaths.find(p => p.id === resolution.details.rerouted_train);
      if (proposedPath) {
        g.append("path")
          .datum(proposedPath.path)
          .attr("class", "proposed-path")
          .attr("d", line)
          .style("stroke", "#f59e0b")
          .style("stroke-width", 3)
          .style("stroke-dasharray", "10,5")
          .style("fill", "none");
      }
    }

  }, [simulationState, conflict, resolution]);

  return (
    <div className="time-distance-graph">
      <svg
        ref={svgRef}
        width={800}
        height={500}
        style={{ border: "1px solid #ccc", background: "#f9fafb" }}
      />
      <div className="legend">
        <div className="legend-item">
          <div className="legend-line dotted" style={{ borderTop: "2px dotted #3b82f6" }}></div>
          <span>Planned Path</span>
        </div>
        <div className="legend-item">
          <div className="legend-line solid" style={{ borderTop: "2px solid #3b82f6" }}></div>
          <span>Actual Path</span>
        </div>
        <div className="legend-item">
          <div className="legend-line dashed" style={{ borderTop: "3px dashed #f59e0b" }}></div>
          <span>Proposed Path</span>
        </div>
      </div>
    </div>
  );
};

export default TimeDistanceGraph;
