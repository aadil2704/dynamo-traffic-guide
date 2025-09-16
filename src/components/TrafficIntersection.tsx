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
  north: 0.7, // High traffic
  south: 0.7, // High traffic  
  east: 0.5,  // Moderate traffic
  west: 0.5   // Moderate traffic
};

export const TrafficIntersection = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [directions, setDirections] = useState<Record<Direction, DirectionState>>({
    north: { signal: 'red', countdown: 0, vehicleCount: 0, allowLeft: true, allowRight: true },
    south: { signal: 'red', countdown: 0, vehicleCount: 0, allowLeft: true, allowRight: true },
    east: { signal: 'green', countdown: 20, vehicleCount: 0, allowLeft: true, allowRight: true },
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

    const currentCount = directions[currentDirection].vehicleCount;
    const currentSignal = directions[currentDirection].signal;
    const currentCountdown = directions[currentDirection].countdown;
    
    // Find direction with highest vehicle count
    const maxVehicleDirection = counts.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    );
    
    // Check if we should switch based on vehicle count priority
    const nextDirection = directionOrder[(currentIndex + 1) % 4];
    const nextCount = directions[nextDirection].vehicleCount;
    
    // Switch conditions (more aggressive):
    // 1. Current direction has no vehicles and countdown < 8
    // 2. Another direction has 3+ more vehicles than current
    // 3. Natural countdown reaches 0
    // 4. Emergency switch if any direction has 10+ vehicles
    
    const emergencyDirection = counts.find(c => c.count >= 10);
    const highDemandDirection = counts.find(c => c.count >= currentCount + 3 && c.direction !== currentDirection);
    
    let shouldSwitch = false;
    let targetDirection = nextDirection;
    let reason = "";
    
    if (emergencyDirection && emergencyDirection.direction !== currentDirection) {
      shouldSwitch = true;
      targetDirection = emergencyDirection.direction;
      reason = `Emergency switch - ${emergencyDirection.count} vehicles waiting`;
    } else if (currentCount === 0 && currentCountdown <= 8) {
      shouldSwitch = true;
      reason = `No vehicles in current direction`;
    } else if (highDemandDirection && currentCountdown <= 10) {
      shouldSwitch = true;
      targetDirection = highDemandDirection.direction;
      reason = `High demand - ${highDemandDirection.count} vs ${currentCount} vehicles`;
    } else if (currentCountdown <= 0 && currentSignal === 'red') {
      shouldSwitch = true;
      reason = `Natural cycle completion`;
    } else if (currentCountdown <= 0 && currentSignal === 'yellow') {
      shouldSwitch = true;
      reason = `Yellow phase complete`;
    }
    
    if (shouldSwitch) {
      const targetCount = directions[targetDirection].vehicleCount;
      const decision = `AI: ${reason} | ${currentDirection}→${targetDirection} (${currentCount}→${targetCount} vehicles)`;
      setAiDecisions(prev => [...prev.slice(-4), decision]);
      
      // Calculate green time: minimum 12s, 2s per vehicle, max 50s
      const greenTime = Math.min(Math.max(12, targetCount * 2), 50);
      return { switchTo: targetDirection, greenTime };
    }
    
    return { switchTo: null, greenTime: 0 };
  }, [currentDirection, directions]);

  // Update signal states - More responsive switching
  useEffect(() => {
    const interval = setInterval(() => {
      setDirections(prev => {
        const newState = { ...prev };
        const decision = makeAIDecision();
        
        // Handle direction switching
        if (decision.switchTo) {
          // Set ALL directions to red first
          Object.keys(newState).forEach(dir => {
            newState[dir as Direction] = {
              ...newState[dir as Direction],
              signal: 'red',
              countdown: 0
            };
          });
          
          // Then set only the target direction to green
          newState[decision.switchTo] = {
            ...newState[decision.switchTo],
            signal: 'green',
            countdown: decision.greenTime
          };
          
          setCurrentDirection(decision.switchTo);
        } else {
          // Handle countdown for current active signal
          Object.keys(newState).forEach(dir => {
            const direction = dir as Direction;
            const state = newState[direction];
            
            if (state.signal === 'green' && state.countdown > 0) {
              newState[direction].countdown -= 1;
            } else if (state.signal === 'green' && state.countdown <= 0) {
              // Switch to yellow for 2 seconds
              newState[direction].signal = 'yellow';
              newState[direction].countdown = 2;
            } else if (state.signal === 'yellow' && state.countdown > 0) {
              newState[direction].countdown -= 1;
            } else if (state.signal === 'yellow' && state.countdown <= 0) {
              // Switch to red
              newState[direction].signal = 'red';
              newState[direction].countdown = 0;
            }
          });
        }

        return newState;
      });
    }, 800); // Faster updates - every 0.8 seconds

    return () => clearInterval(interval);
  }, [makeAIDecision]);

  // Spawn vehicles - More frequent spawning for better demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      const newVehicles: VehicleData[] = [];
      
      // Ensure all directions get vehicles
      Object.entries(SPAWN_RATES).forEach(([direction, baseRate]) => {
        // Increase spawn rate if direction has been waiting
        const waitingTime = directions[direction as Direction].signal === 'red' ? 1.5 : 1;
        const adjustedRate = baseRate * waitingTime;
        
        if (Math.random() < adjustedRate) {
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
    }, 1200); // Faster spawning - every 1.2 seconds

    return () => clearInterval(interval);
  }, [directions]);

  // Update vehicle positions and count vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => {
        const updated = prev
          .map(vehicle => {
            // Check if vehicle should stop at intersection
            const canMove = directions[vehicle.direction].signal === 'green';
            const atIntersection = vehicle.position >= 40 && vehicle.position <= 50;
            
            // Stop if signal is red/yellow and approaching intersection
            if (!canMove && vehicle.position < 45) {
              return { ...vehicle, position: Math.min(vehicle.position, 42) }; // Stop before intersection
            }
            
            // Move normally if signal is green or already past intersection
            return {
              ...vehicle,
              position: vehicle.position + vehicle.speed
            };
          })
          .filter(vehicle => vehicle.position < 100); // Remove vehicles that passed

        // Count vehicles waiting at intersection (stopped vehicles)
        const counts = {
          north: updated.filter(v => v.direction === 'north' && v.position < 45).length,
          south: updated.filter(v => v.direction === 'south' && v.position < 45).length,
          east: updated.filter(v => v.direction === 'east' && v.position < 45).length,
          west: updated.filter(v => v.direction === 'west' && v.position < 45).length
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
    }, 150); // Slightly slower for better control

    return () => clearInterval(interval);
  }, [directions]);

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