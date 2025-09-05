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

interface Resolution {
  solution_type: string;
  details: any;
  cost: number;
}

interface Props {
  simulationState: SimulationState | null;
  resolution: Resolution | null;
}

const TrackOccupancyGraph: React.FC<Props> = ({ simulationState, resolution }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define data
    const stations = [
      { id: "A", name: "Station A", tracks: ["Main Line", "Loop Line"] },
      { id: "B", name: "Station B", tracks: ["Main Line", "Loop Line"] },
      { id: "C", name: "Station C", tracks: ["Main Line", "Loop Line"] }
    ];

    const trackHeight = 30;
    const stationHeight = stations[0].tracks.length * trackHeight + 10;

    // Create scale for time
    const timeExtent = [
      new Date(2025, 8, 5, 9, 0), // 9:00 AM
      new Date(2025, 8, 5, 11, 0)  // 11:00 AM
    ];
    const timeScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, width]);

    // Create scale for stations
    const stationScale = d3.scaleBand()
      .domain(stations.map(s => s.id))
      .range([0, height])
      .padding(0.1);

    // Draw station headers
    stations.forEach((station, stationIndex) => {
      const y = stationScale(station.id)!;
      
      // Station name
      g.append("text")
        .attr("x", -10)
        .attr("y", y + stationHeight / 2)
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .text(station.name);

      // Draw tracks for this station
      station.tracks.forEach((track, trackIndex) => {
        const trackY = y + trackIndex * trackHeight + 5;
        
        // Track background
        g.append("rect")
          .attr("x", 0)
          .attr("y", trackY)
          .attr("width", width)
          .attr("height", trackHeight - 5)
          .style("fill", "#f3f4f6")
          .style("stroke", "#d1d5db")
          .style("stroke-width", 1);

        // Track label
        g.append("text")
          .attr("x", -5)
          .attr("y", trackY + trackHeight / 2)
          .style("text-anchor", "end")
          .style("font-size", "10px")
          .style("fill", "#6b7280")
          .text(track);
      });
    });

    // Draw time axis
    const timeAxis = d3.axisTop(timeScale)
      .tickFormat((d) => d3.timeFormat("%H:%M")(d as Date));

    g.append("g")
      .attr("class", "time-axis")
      .call(timeAxis as any);

    // Sample occupancy data (blue blocks for original schedule)
    const originalOccupancy = [
      { station: "A", track: "Main Line", start: new Date(2025, 8, 5, 9, 0), end: new Date(2025, 8, 5, 9, 10), train: "T001" },
      { station: "B", track: "Main Line", start: new Date(2025, 8, 5, 9, 25), end: new Date(2025, 8, 5, 9, 35), train: "T001" },
      { station: "C", track: "Main Line", start: new Date(2025, 8, 5, 9, 50), end: new Date(2025, 8, 5, 10, 0), train: "T001" },
      { station: "C", track: "Main Line", start: new Date(2025, 8, 5, 9, 10), end: new Date(2025, 8, 5, 9, 20), train: "T002" },
      { station: "B", track: "Main Line", start: new Date(2025, 8, 5, 9, 35), end: new Date(2025, 8, 5, 9, 45), train: "T002" },
      { station: "A", track: "Main Line", start: new Date(2025, 8, 5, 10, 0), end: new Date(2025, 8, 5, 10, 10), train: "T002" }
    ];

    // Draw original occupancy blocks
    originalOccupancy.forEach(block => {
      const station = stations.find(s => s.id === block.station);
      if (!station) return;

      const stationY = stationScale(block.station)!;
      const trackIndex = station.tracks.findIndex(t => t === block.track);
      const trackY = stationY + trackIndex * trackHeight + 5;

      const blockWidth = timeScale(block.end) - timeScale(block.start);

      g.append("rect")
        .attr("x", timeScale(block.start))
        .attr("y", trackY + 2)
        .attr("width", blockWidth)
        .attr("height", trackHeight - 9)
        .style("fill", "#3b82f6")
        .style("opacity", 0.7)
        .style("stroke", "#2563eb")
        .style("stroke-width", 1)
        .style("rx", 3);

      // Add train label
      g.append("text")
        .attr("x", timeScale(block.start) + blockWidth / 2)
        .attr("y", trackY + trackHeight / 2)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text(block.train);
    });

    // Draw proposed changes (orange blocks)
    if (resolution && resolution.solution_type === "reroute") {
      const rerouting = resolution.details;
      
      // Find the original block that's being rerouted
      const originalBlock = originalOccupancy.find(b => 
        b.train === rerouting.rerouted_train && 
        b.station === rerouting.location
      );

      if (originalBlock) {
        const station = stations.find(s => s.id === rerouting.location);
        if (station) {
          const stationY = stationScale(rerouting.location)!;
          const newTrackIndex = station.tracks.findIndex(t => t === rerouting.to_track.charAt(0).toUpperCase() + rerouting.to_track.slice(1) + " Line");
          
          if (newTrackIndex >= 0) {
            const trackY = stationY + newTrackIndex * trackHeight + 5;
            const blockWidth = timeScale(originalBlock.end) - timeScale(originalBlock.start);

            // Draw proposed block
            g.append("rect")
              .attr("x", timeScale(originalBlock.start))
              .attr("y", trackY + 2)
              .attr("width", blockWidth)
              .attr("height", trackHeight - 9)
              .style("fill", "#f59e0b")
              .style("opacity", 0.8)
              .style("stroke", "#d97706")
              .style("stroke-width", 2)
              .style("stroke-dasharray", "3,3")
              .style("rx", 3);

            // Add train label
            g.append("text")
              .attr("x", timeScale(originalBlock.start) + blockWidth / 2)
              .attr("y", trackY + trackHeight / 2)
              .style("text-anchor", "middle")
              .style("font-size", "10px")
              .style("fill", "white")
              .style("font-weight", "bold")
              .text(rerouting.rerouted_train);

            // Add "PROPOSED" label
            g.append("text")
              .attr("x", timeScale(originalBlock.start) + blockWidth + 5)
              .attr("y", trackY + trackHeight / 2)
              .style("font-size", "9px")
              .style("fill", "#f59e0b")
              .style("font-weight", "bold")
              .text("PROPOSED");
          }
        }
      }
    }

    // Add current time indicator
    if (simulationState) {
      const currentTime = new Date(simulationState.current_time);
      const currentX = timeScale(currentTime);

      g.append("line")
        .attr("x1", currentX)
        .attr("x2", currentX)
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#ef4444")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5");

      g.append("text")
        .attr("x", currentX + 5)
        .attr("y", -5)
        .style("font-size", "10px")
        .style("fill", "#ef4444")
        .style("font-weight", "bold")
        .text("NOW");
    }

  }, [simulationState, resolution]);

  return (
    <div className="track-occupancy-graph">
      <svg
        ref={svgRef}
        width={600}
        height={400}
        style={{ border: "1px solid #ccc", background: "#f9fafb" }}
      />
      <div className="legend">
        <div className="legend-item">
          <div className="legend-block" style={{ backgroundColor: "#3b82f6", opacity: 0.7 }}></div>
          <span>Original Schedule</span>
        </div>
        <div className="legend-item">
          <div className="legend-block dashed" style={{ backgroundColor: "#f59e0b", opacity: 0.8, border: "2px dashed #d97706" }}></div>
          <span>Proposed Changes</span>
        </div>
      </div>
    </div>
  );
};

export default TrackOccupancyGraph;
