import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

type Direction = 'north' | 'south' | 'east' | 'west';
type SignalState = 'red' | 'yellow' | 'green';

interface DirectionState {
  signal: SignalState;
  countdown: number;
  vehicleCount: number;
  allowLeft: boolean;
  allowRight: boolean;
}

interface TrafficLightProps {
  direction: Direction;
  state: DirectionState;
  className?: string;
}

export const TrafficLight = ({ direction, state, className = '' }: TrafficLightProps) => {
  const getSignalColor = (lightType: SignalState) => {
    if (state.signal === lightType) {
      switch (lightType) {
        case 'red': return 'bg-traffic-red traffic-light-active';
        case 'yellow': return 'bg-traffic-yellow traffic-light-active';
        case 'green': return 'bg-traffic-green traffic-light-active';
      }
    }
    return 'bg-muted border-border';
  };

  const getDirectionArrow = () => {
    switch (direction) {
      case 'north': return <ArrowUp className="w-4 h-4" />;
      case 'south': return <ArrowUp className="w-4 h-4 rotate-180" />;
      case 'east': return <ArrowRight className="w-4 h-4" />;
      case 'west': return <ArrowLeft className="w-4 h-4" />;
    }
  };

  return (
    <div className={`dashboard-card bg-card/90 backdrop-blur-sm ${className}`}>
      {/* Direction indicator */}
      <div className="flex items-center justify-center mb-2 text-sm font-bold text-accent">
        {getDirectionArrow()}
        <span className="ml-1 capitalize">{direction}</span>
      </div>
      
      {/* Traffic lights */}
      <div className="flex flex-col items-center space-y-1 mb-3">
        <div className={`signal-indicator ${getSignalColor('red')}`}></div>
        <div className={`signal-indicator ${getSignalColor('yellow')}`}></div>
        <div className={`signal-indicator ${getSignalColor('green')}`}></div>
      </div>
      
      {/* Turn indicators */}
      <div className="flex justify-center space-x-2 mb-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
          state.allowLeft && state.signal === 'green' 
            ? 'bg-traffic-green text-background' 
            : 'bg-muted text-muted-foreground'
        }`}>
          <ArrowLeft className="w-3 h-3" />
        </div>
        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
          state.signal === 'green' 
            ? 'bg-traffic-green text-background' 
            : 'bg-muted text-muted-foreground'
        }`}>
          <ArrowUp className="w-3 h-3" />
        </div>
        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
          state.allowRight && state.signal === 'green'
            ? 'bg-traffic-green text-background'
            : 'bg-muted text-muted-foreground'
        }`}>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      
      {/* Countdown and vehicle count */}
      <div className="text-center">
        {state.countdown > 0 && (
          <div className="text-lg font-bold text-accent">
            {state.countdown}s
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          {state.vehicleCount} vehicles
        </div>
      </div>
    </div>
  );
};