import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, Clock, Car } from 'lucide-react';

type Direction = 'north' | 'south' | 'east' | 'west';
type SignalState = 'red' | 'yellow' | 'green';

interface DirectionState {
  signal: SignalState;
  countdown: number;
  vehicleCount: number;
  allowLeft: boolean;
  allowRight: boolean;
}

interface TrafficStatsProps {
  directions: Record<Direction, DirectionState>;
  currentDirection: Direction;
  aiDecisions: string[];
}

export const TrafficStats = ({ directions, currentDirection, aiDecisions }: TrafficStatsProps) => {
  const getTotalVehicles = () => {
    return Object.values(directions).reduce((sum, dir) => sum + dir.vehicleCount, 0);
  };

  const getSignalBadgeColor = (signal: SignalState) => {
    switch (signal) {
      case 'green': return 'bg-traffic-green text-background';
      case 'yellow': return 'bg-traffic-yellow text-background';
      case 'red': return 'bg-traffic-red text-background';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrafficDensity = (count: number) => {
    if (count >= 15) return { label: 'Heavy', color: 'text-danger' };
    if (count >= 8) return { label: 'Moderate', color: 'text-warning' };
    if (count >= 3) return { label: 'Light', color: 'text-success' };
    return { label: 'Clear', color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-4">
      {/* System Status */}
      <Card className="dashboard-card">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-success" />
          <h3 className="font-bold text-lg">System Status</h3>
        </div>
        
        <div className="space-y-3">
          <div className="stats-display">
            <div className="text-sm text-muted-foreground">Total Vehicles</div>
            <div className="text-2xl font-bold text-accent">{getTotalVehicles()}</div>
          </div>
          
          <div className="stats-display">
            <div className="text-sm text-muted-foreground">Active Direction</div>
            <Badge variant="outline" className="text-sm capitalize bg-primary text-primary-foreground">
              <Car className="w-3 h-3 mr-1" />
              {currentDirection}
            </Badge>
          </div>
          
          <div className="stats-display">
            <div className="text-sm text-muted-foreground">AI Status</div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              Active & Learning
            </div>
          </div>
        </div>
      </Card>

      {/* Direction Stats */}
      <Card className="dashboard-card">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-info" />
          <h3 className="font-bold text-lg">Direction Status</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(directions).map(([direction, state]) => {
            const density = getTrafficDensity(state.vehicleCount);
            return (
              <div key={direction} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getSignalBadgeColor(state.signal)} text-xs`}>
                    {state.signal.toUpperCase()}
                  </Badge>
                  <span className="capitalize font-medium">{direction}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold">{state.vehicleCount}</div>
                  <div className={`text-xs ${density.color}`}>{density.label}</div>
                  {state.countdown > 0 && (
                    <div className="text-xs text-accent">{state.countdown}s</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Decisions Log */}
      <Card className="dashboard-card">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">AI Decisions</h3>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {aiDecisions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Analyzing traffic patterns...
            </div>
          ) : (
            aiDecisions.slice(-5).reverse().map((decision, index) => (
              <div key={index} className="bg-muted p-2 rounded text-xs">
                <div className="text-muted-foreground mb-1">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="text-foreground">{decision}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="dashboard-card">
        <h3 className="font-bold text-lg mb-4">Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="stats-display">
            <div className="text-xs text-muted-foreground">Avg Wait</div>
            <div className="text-lg font-bold text-success">12s</div>
          </div>
          <div className="stats-display">
            <div className="text-xs text-muted-foreground">Efficiency</div>
            <div className="text-lg font-bold text-info">94%</div>
          </div>
          <div className="stats-display">
            <div className="text-xs text-muted-foreground">Throughput</div>
            <div className="text-lg font-bold text-warning">85/min</div>
          </div>
          <div className="stats-display">
            <div className="text-xs text-muted-foreground">CO₂ Saved</div>
            <div className="text-lg font-bold text-primary">23%</div>
          </div>
        </div>
      </Card>
    </div>
  );
};