type Direction = 'north' | 'south' | 'east' | 'west';
type TurnDirection = 'straight' | 'left' | 'right';

interface VehicleData {
  id: string;
  direction: Direction;
  turn: TurnDirection;
  type: string;
  position: number;
  speed: number;
}

interface VehicleProps {
  vehicle: VehicleData;
  canMove: boolean;
}

export const Vehicle = ({ vehicle, canMove }: VehicleProps) => {
  const getVehiclePosition = () => {
    const centerX = 50; // Center of intersection (percentage)
    const centerY = 50;
    const roadWidth = 16; // Road width (percentage)
    
    // Calculate position based on direction and progress
    let x = 0, y = 0;
    const progress = vehicle.position;
    
    switch (vehicle.direction) {
      case 'north':
        x = centerX - roadWidth/4; // Left lane
        y = 100 - progress; // Moving up
        break;
      case 'south':
        x = centerX + roadWidth/4; // Right lane
        y = progress; // Moving down
        break;
      case 'east':
        x = progress; // Moving right
        y = centerY - roadWidth/4; // Top lane
        break;
      case 'west':
        x = 100 - progress; // Moving left
        y = centerY + roadWidth/4; // Bottom lane
        break;
    }
    
    return { x, y };
  };

  const getVehicleRotation = () => {
    switch (vehicle.direction) {
      case 'north': return 'rotate-0';
      case 'south': return 'rotate-180';
      case 'east': return 'rotate-90';
      case 'west': return 'rotate-270';
      default: return 'rotate-0';
    }
  };

  const getTurnIndicator = () => {
    if (vehicle.turn === 'left') return '⬅️';
    if (vehicle.turn === 'right') return '➡️';
    return '';
  };

  const position = getVehiclePosition();
  
  // Check if vehicle is stopped at intersection
  const isWaitingAtIntersection = !canMove && vehicle.position <= 42 && vehicle.position >= 35;
  const isPastIntersection = vehicle.position > 50;
  
  return (
    <div
      className={`absolute transition-all duration-200 ${getVehicleRotation()}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}
    >
      <div className="relative">
        {/* Vehicle emoji */}
        <div className={`text-2xl transition-opacity duration-300 ${
          isWaitingAtIntersection ? 'opacity-60' : 'opacity-100'
        }`}>
          {vehicle.type}
        </div>
        
        {/* Turn indicator */}
        {vehicle.turn !== 'straight' && (
          <div className="absolute -top-1 -right-1 text-xs">
            {getTurnIndicator()}
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          {isWaitingAtIntersection && (
            <div className="w-2 h-2 bg-traffic-red rounded-full"></div>
          )}
          {canMove && !isWaitingAtIntersection && (
            <div className="w-1 h-1 bg-traffic-green rounded-full animate-pulse"></div>
          )}
        </div>
        
        {/* Brake lights for stopped vehicles */}
        {isWaitingAtIntersection && (
          <div className="absolute inset-0 bg-traffic-red rounded-full opacity-20 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};