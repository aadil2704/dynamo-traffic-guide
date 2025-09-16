import { useState, useEffect, useCallback } from 'react';
import { TrafficLight } from './TrafficLight';
import { Vehicle } from './Vehicle';
import { TrafficStats } from './TrafficStats';

type Direction = 'north' | 'south' | 'east' | 'west';
type SignalState = 'red' | 'yellow' | 'green';
type TurnDirection = 'straight' | 'left' | 'right';

interface VehicleData {
  id: string;
  direction: Direction;
  turn: TurnDirection;
  type: string;
  position: number;
  speed: number;
}

interface DirectionState {
  signal: SignalState;
  countdown: number;
  vehicleCount: number;
  allowLeft: boolean;
  allowRight: boolean;
}

const VEHICLE_EMOJIS = ['🚗', '🚙', '🚐', '🚛', '🚌', '🏎️'];
const SPAWN_RATES = {
  north: 0.8, // High traffic
  south: 0.8, // High traffic  
  east: 0.3,  // Low traffic
  west: 0.3   // Low traffic
};

export const TrafficIntersection = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [directions, setDirections] = useState<Record<Direction, DirectionState>>({
    north: { signal: 'red', countdown: 0, vehicleCount: 0, allowLeft: true, allowRight: true },
    south: { signal: 'red', countdown: 0, vehicleCount: 0, allowLeft: true, allowRight: true },
    east: { signal: 'green', countdown: 30, vehicleCount: 0, allowLeft: true, allowRight: true },
    west: { signal: 'red', countdown: 0, vehicleCount: 0, allowLeft: true, allowRight: true }
  });
  const [currentDirection, setCurrentDirection] = useState<Direction>('east');
  const [aiDecisions, setAiDecisions] = useState<string[]>([]);

  // AI Decision Engine
  const makeAIDecision = useCallback(() => {
    const directionOrder: Direction[] = ['north', 'east', 'south', 'west'];
    const currentIndex = directionOrder.indexOf(currentDirection);
    
    // Get vehicle counts for each direction
    const counts = Object.entries(directions).map(([dir, state]) => ({
      direction: dir as Direction,
      count: state.vehicleCount
    }));

    // AI Logic: Calculate optimal green time based on vehicle count
    const currentCount = directions[currentDirection].vehicleCount;
    
    // Base time of 10 seconds, plus 1.5 seconds per vehicle, max 45 seconds
    const optimalTime = Math.min(Math.max(10, currentCount * 1.5), 45);
    
    // Check if we should switch to next direction
    const nextDirection = directionOrder[(currentIndex + 1) % 4];
    const nextCount = directions[nextDirection].vehicleCount;
    
    // Switch if current direction has few vehicles or next direction has significantly more
    const shouldSwitch = currentCount <= 2 || (nextCount > currentCount * 2 && directions[currentDirection].countdown <= 5);
    
    if (shouldSwitch && directions[currentDirection].countdown <= 0) {
      const decision = `AI: Switching from ${currentDirection} to ${nextDirection} - Current: ${currentCount} vehicles, Next: ${nextCount} vehicles`;
      setAiDecisions(prev => [...prev.slice(-4), decision]);
      return { switchTo: nextDirection, greenTime: Math.min(Math.max(10, nextCount * 1.5), 45) };
    }
    
    return { switchTo: null, greenTime: optimalTime };
  }, [currentDirection, directions]);

  // Update signal states
  useEffect(() => {
    const interval = setInterval(() => {
      setDirections(prev => {
        const newState = { ...prev };
        const decision = makeAIDecision();
        
        // Handle direction switching
        if (decision.switchTo) {
          Object.keys(newState).forEach(dir => {
            if (dir === decision.switchTo) {
              newState[dir as Direction] = {
                ...newState[dir as Direction],
                signal: 'green',
                countdown: decision.greenTime
              };
            } else {
              newState[dir as Direction] = {
                ...newState[dir as Direction],
                signal: 'red',
                countdown: 0
              };
            }
          });
          setCurrentDirection(decision.switchTo);
        } else {
          // Countdown existing green light
          Object.keys(newState).forEach(dir => {
            if (newState[dir as Direction].signal === 'green' && newState[dir as Direction].countdown > 0) {
              newState[dir as Direction].countdown -= 1;
            }
            if (newState[dir as Direction].countdown <= 0 && newState[dir as Direction].signal === 'green') {
              newState[dir as Direction].signal = 'yellow';
              newState[dir as Direction].countdown = 3;
            }
            if (newState[dir as Direction].countdown <= 0 && newState[dir as Direction].signal === 'yellow') {
              newState[dir as Direction].signal = 'red';
            }
          });
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [makeAIDecision]);

  // Spawn vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      const newVehicles: VehicleData[] = [];
      
      Object.entries(SPAWN_RATES).forEach(([direction, rate]) => {
        if (Math.random() < rate) {
          const turnChoice = Math.random();
          let turn: TurnDirection = 'straight';
          if (turnChoice < 0.2) turn = 'left';
          else if (turnChoice < 0.35) turn = 'right';
          
          const vehicle: VehicleData = {
            id: `${direction}-${Date.now()}-${Math.random()}`,
            direction: direction as Direction,
            turn,
            type: VEHICLE_EMOJIS[Math.floor(Math.random() * VEHICLE_EMOJIS.length)],
            position: 0,
            speed: 1
          };
          newVehicles.push(vehicle);
        }
      });

      if (newVehicles.length > 0) {
        setVehicles(prev => [...prev, ...newVehicles]);
      }
    }, 1500); // Spawn every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update vehicle positions and count vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => {
        const updated = prev
          .map(vehicle => ({
            ...vehicle,
            position: vehicle.position + vehicle.speed
          }))
          .filter(vehicle => vehicle.position < 100); // Remove vehicles that passed

        // Count vehicles near intersection (waiting)
        const counts = {
          north: updated.filter(v => v.direction === 'north' && v.position < 50).length,
          south: updated.filter(v => v.direction === 'south' && v.position < 50).length,
          east: updated.filter(v => v.direction === 'east' && v.position < 50).length,
          west: updated.filter(v => v.direction === 'west' && v.position < 50).length
        };

        setDirections(prev => {
          const newState = { ...prev };
          Object.entries(counts).forEach(([dir, count]) => {
            newState[dir as Direction].vehicleCount = count;
          });
          return newState;
        });

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          AI Traffic Control System
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <TrafficStats 
              directions={directions} 
              currentDirection={currentDirection}
              aiDecisions={aiDecisions}
            />
          </div>

          {/* Intersection */}
          <div className="lg:col-span-3">
            <div className="relative w-full h-[600px] bg-road-surface rounded-lg border-4 border-road-line overflow-hidden">
              {/* Roads */}
              <div className="absolute inset-0">
                {/* Horizontal road */}
                <div className="absolute top-1/2 left-0 w-full h-32 bg-road-surface transform -translate-y-1/2">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-road-line transform -translate-y-1/2"></div>
                </div>
                
                {/* Vertical road */}
                <div className="absolute left-1/2 top-0 w-32 h-full bg-road-surface transform -translate-x-1/2">
                  <div className="absolute left-1/2 top-0 w-1 h-full bg-road-line transform -translate-x-1/2"></div>
                </div>
                
                {/* Central intersection */}
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-road-intersection transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              {/* Traffic Lights */}
              <TrafficLight 
                direction="north" 
                state={directions.north}
                className="absolute top-4 left-1/2 transform -translate-x-1/2"
              />
              <TrafficLight 
                direction="south" 
                state={directions.south}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              />
              <TrafficLight 
                direction="east" 
                state={directions.east}
                className="absolute top-1/2 right-4 transform -translate-y-1/2"
              />
              <TrafficLight 
                direction="west" 
                state={directions.west}
                className="absolute top-1/2 left-4 transform -translate-y-1/2"
              />

              {/* Vehicles */}
              {vehicles.map(vehicle => (
                <Vehicle 
                  key={vehicle.id}
                  vehicle={vehicle}
                  canMove={directions[vehicle.direction].signal === 'green'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};