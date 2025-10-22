import { NextResponse } from 'next/server';

// Simple in-memory log storage (for debugging)
const webhookLogs: Array<{
  timestamp: string;
  method: string;
  success: boolean;
  eventCount?: number;
  error?: string;
}> = [];

// Function to add log entry (called from webhook)
export function logWebhookActivity(method: string, success: boolean, eventCount?: number, error?: string) {
  webhookLogs.push({
    timestamp: new Date().toISOString(),
    method,
    success,
    eventCount,
    error
  });
  
  // Keep only last 50 logs
  if (webhookLogs.length > 50) {
    webhookLogs.shift();
  }
}

// GET endpoint to view webhook activity logs
export async function GET() {
  return NextResponse.json({
    status: 'active',
    totalLogs: webhookLogs.length,
    logs: webhookLogs.slice(-20), // Last 20 logs
    summary: {
      totalRequests: webhookLogs.length,
      successfulPosts: webhookLogs.filter(log => log.method === 'POST' && log.success).length,
      failedPosts: webhookLogs.filter(log => log.method === 'POST' && !log.success).length,
      getRequests: webhookLogs.filter(log => log.method === 'GET').length,
      totalEvents: webhookLogs.reduce((sum, log) => sum + (log.eventCount || 0), 0)
    }
  });
}