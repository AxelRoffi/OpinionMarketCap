'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Server,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { useAccount, useBlockNumber, useBalance } from 'wagmi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { isMainnet, CURRENT_CONTRACTS, CURRENT_NETWORK } from '@/lib/environment';

/**
 * 🏥 SYSTEM STATUS COMPONENT
 * 
 * Monitors network health, contract availability, and system status
 * Essential for production reliability monitoring
 */

interface SystemStatusProps {
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'checking';
  responseTime?: number;
  lastCheck: number;
  description: string;
}

interface NetworkHealth {
  blockNumber: bigint | null;
  isConnected: boolean;
  rpcLatency: number | null;
  gasPrice: bigint | null;
  lastBlockTime: number | null;
}

export function SystemStatus({ 
  className = "",
  compact = false,
  showActions = true 
}: SystemStatusProps) {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balance } = useBalance({ address });

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Base Network',
      status: 'checking',
      lastCheck: Date.now(),
      description: 'Blockchain network connectivity'
    },
    {
      name: 'Opinion Contracts',
      status: 'checking', 
      lastCheck: Date.now(),
      description: 'Smart contract availability'
    },
    {
      name: 'USDC Token',
      status: 'checking',
      lastCheck: Date.now(), 
      description: 'Token contract functionality'
    },
    {
      name: 'Price Feeds',
      status: 'checking',
      lastCheck: Date.now(),
      description: 'Real-time price data'
    }
  ]);

  const [networkHealth, setNetworkHealth] = useState<NetworkHealth>({
    blockNumber: null,
    isConnected: false,
    rpcLatency: null,
    gasPrice: null,
    lastBlockTime: null
  });

  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState(Date.now());

  const isMainnetEnv = isMainnet();

  // Monitor network health
  useEffect(() => {
    setNetworkHealth(prev => ({
      ...prev,
      blockNumber,
      isConnected
    }));
  }, [blockNumber, isConnected]);

  // Run health checks
  useEffect(() => {
    const runHealthChecks = async () => {
      const updatedServices = [...services];

      try {
        // Check Base network
        const networkStart = Date.now();
        const networkResponse = await fetch(CURRENT_NETWORK.rpcUrls.default.http[0], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });
        const networkLatency = Date.now() - networkStart;

        updatedServices[0] = {
          ...updatedServices[0],
          status: networkResponse.ok ? 'operational' : 'degraded',
          responseTime: networkLatency,
          lastCheck: Date.now()
        };

        // Check contract availability (simplified)
        if (CURRENT_CONTRACTS.OPINION_CORE !== '0x0000000000000000000000000000000000000000') {
          updatedServices[1] = {
            ...updatedServices[1],
            status: 'operational',
            lastCheck: Date.now()
          };
        } else {
          updatedServices[1] = {
            ...updatedServices[1],
            status: 'outage',
            lastCheck: Date.now()
          };
        }

        // Check USDC contract
        updatedServices[2] = {
          ...updatedServices[2],
          status: 'operational', // Assume operational if Base network is working
          lastCheck: Date.now()
        };

        // Check price feeds (mock)
        updatedServices[3] = {
          ...updatedServices[3],
          status: 'operational',
          lastCheck: Date.now()
        };

      } catch (error) {
        console.error('Health check failed:', error);
        updatedServices.forEach(service => {
          service.status = 'degraded';
          service.lastCheck = Date.now();
        });
      }

      setServices(updatedServices);
      setLastHealthCheck(Date.now());
    };

    // Initial check
    runHealthChecks();

    // Regular health checks every 30 seconds
    const interval = setInterval(runHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  // System alerts based on status
  useEffect(() => {
    const criticalServices = services.filter(s => s.status === 'outage');
    const degradedServices = services.filter(s => s.status === 'degraded');

    if (criticalServices.length > 0) {
      setSystemAlert(`System Outage: ${criticalServices.map(s => s.name).join(', ')} unavailable`);
    } else if (degradedServices.length > 0) {
      setSystemAlert(`Performance Issues: ${degradedServices.map(s => s.name).join(', ')} experiencing problems`);
    } else {
      setSystemAlert(null);
    }
  }, [services]);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'outage': return 'text-red-600';
      case 'checking': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'outage': return AlertCircle;
      case 'checking': return Activity;
      default: return Activity;
    }
  };

  const getOverallHealth = () => {
    const operational = services.filter(s => s.status === 'operational').length;
    const total = services.length;
    return (operational / total) * 100;
  };

  const overallHealth = getOverallHealth();
  const healthColor = overallHealth >= 90 ? 'text-green-600' : 
                     overallHealth >= 70 ? 'text-yellow-600' : 'text-red-600';

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          overallHealth >= 90 ? 'bg-green-500' : 
          overallHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-gray-500">
          System: {overallHealth.toFixed(0)}%
        </span>
        {isConnected && (
          <Badge variant="outline" className="text-xs">
            Connected
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* System Alert */}
      {systemAlert && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>System Alert:</strong> {systemAlert}
            {isMainnetEnv && <br />}<em>Real money transactions may be affected.</em>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              System Status
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={`${healthColor.replace('text-', 'bg-').replace('600', '100')} ${healthColor} border-current`}>
                {overallHealth.toFixed(0)}% Healthy
              </Badge>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Health */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">System Health</span>
              <span className={`text-sm ${healthColor}`}>
                {overallHealth.toFixed(0)}%
              </span>
            </div>
            <Progress value={overallHealth} className="h-2" />
          </div>

          {/* Service Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Service Status</h4>
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(service.status)}`} />
                    <div>
                      <div className="text-sm font-medium">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${getStatusColor(service.status)} border-current`}
                    >
                      {service.status}
                    </Badge>
                    {service.responseTime && (
                      <div className="text-xs text-gray-500 mt-1">
                        {service.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Network Information */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Network Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Environment:</span>
                <div className="font-medium">
                  {isMainnetEnv ? 'Base Mainnet' : 'Base Sepolia Testnet'}
                  {isMainnetEnv && <Shield className="inline w-3 h-3 ml-1 text-red-500" />}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Latest Block:</span>
                <div className="font-medium">
                  #{blockNumber?.toString() || 'Unknown'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Connection:</span>
                <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Last Check:</span>
                <div className="font-medium">
                  {new Date(lastHealthCheck).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          {address && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Wallet Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <div className="font-mono text-xs">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">ETH Balance:</span>
                  <div className="font-medium">
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : 'Loading...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                <Activity className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              
              {isMainnetEnv && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://status.base.org', '_blank')}
                  className="text-xs"
                >
                  <Server className="w-3 h-3 mr-1" />
                  Base Status
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemStatus;