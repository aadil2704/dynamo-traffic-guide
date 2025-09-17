import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Car, TrendingUp, Zap, Timer, BarChart3 } from "lucide-react";

interface TrafficSystemDetailsProps {
  currentDirection: 'north' | 'south' | 'east' | 'west';
  cycleTime: number;
  vehicleCounts: Record<string, number>;
  incomingVehicles: Record<string, number>;
  cycleDuration: number;
}

export const TrafficSystemDetails = ({ 
  currentDirection, 
  cycleTime, 
  vehicleCounts, 
  incomingVehicles, 
  cycleDuration 
}: TrafficSystemDetailsProps) => {
  const totalWaitingVehicles = Object.values(vehicleCounts).reduce((sum, count) => sum + count, 0);
  const totalIncomingVehicles = Object.values(incomingVehicles).reduce((sum, count) => sum + count, 0);
  const averageWaitTime = totalWaitingVehicles > 0 ? (cycleDuration * 3) / totalWaitingVehicles : 0;
  const systemEfficiency = Math.max(0, 100 - (totalWaitingVehicles * 5));
  const throughputRate = Math.floor((totalIncomingVehicles / 4) * 12); // vehicles per hour estimate
  
  const remainingTime = (cycleDuration - cycleTime) / 1000;
  const greenLightDuration = cycleDuration / 1000;

  const directions = ['north', 'south', 'east', 'west'] as const;
  const currentIndex = directions.indexOf(currentDirection);
  const nextDirection = directions[(currentIndex + 1) % directions.length];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              System Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Real-time traffic light system performance metrics
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-traffic-green/10 text-traffic-green border-traffic-green/20">
            System Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Cycle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Timer className="w-4 h-4 text-primary" />
              Current Light Cycle
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Direction:</span>
                <Badge className="bg-traffic-green/20 text-traffic-green border-traffic-green/30">
                  {currentDirection.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Green Light Duration:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {greenLightDuration.toFixed(1)}s (adaptive)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Timing Range:</span>
                <span className="font-mono text-xs text-muted-foreground">20s - 60s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time Remaining:</span>
                <span className="font-mono text-sm text-traffic-yellow">{remainingTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Direction:</span>
                <span className="font-medium text-sm">{nextDirection.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4 text-primary" />
              Traffic Flow Metrics
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Waiting:</span>
                <span className="font-mono text-sm">{totalWaitingVehicles} vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Incoming:</span>
                <span className="font-mono text-sm">{totalIncomingVehicles} vehicles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Wait Time:</span>
                <span className="font-mono text-sm">{averageWaitTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Throughput Rate:</span>
                <span className="font-mono text-sm">{throughputRate}/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-primary" />
            System Performance
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Traffic Efficiency</span>
                <span className="text-sm font-mono">{systemEfficiency.toFixed(1)}%</span>
              </div>
              <Progress value={systemEfficiency} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Cycle Progress</span>
                <span className="text-sm font-mono">{((cycleTime / cycleDuration) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(cycleTime / cycleDuration) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Direction-specific Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Car className="w-4 h-4 text-primary" />
            Direction Analysis
          </div>
          <div className="grid grid-cols-2 gap-3">
            {directions.map((direction) => {
              const isActive = direction === currentDirection;
              const waitingCount = vehicleCounts[direction];
              const incomingCount = incomingVehicles[direction];
              const congestionLevel = waitingCount > 3 ? 'High' : waitingCount > 1 ? 'Medium' : 'Low';
              const congestionColor = waitingCount > 3 ? 'text-traffic-red' : waitingCount > 1 ? 'text-traffic-yellow' : 'text-traffic-green';
              
              return (
                <div key={direction} className={`p-3 rounded-lg border ${isActive ? 'bg-traffic-green/5 border-traffic-green/20' : 'bg-muted/20 border-border/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{direction.toUpperCase()}</span>
                    {isActive && <Badge className="text-xs bg-traffic-green/20 text-traffic-green">ACTIVE</Badge>}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waiting:</span>
                      <span>{waitingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incoming:</span>
                      <span>{incomingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Congestion:</span>
                      <span className={congestionColor}>{congestionLevel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Clock className="w-4 h-4 text-primary" />
            Technical Specifications
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="block font-medium">Timing Mode:</span>
              <span>Adaptive (20-60s)</span>
            </div>
            <div>
              <span className="block font-medium">Update Rate:</span>
              <span>100ms</span>
            </div>
            <div>
              <span className="block font-medium">Response Time:</span>
              <span>&lt;50ms</span>
            </div>
            <div>
              <span className="block font-medium">Safety Buffer:</span>
              <span>2.0s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};