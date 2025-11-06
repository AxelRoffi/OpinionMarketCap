import { NextResponse } from 'next/server';

// Simple in-memory log storage (for debugging)
const webhookLogs: Array<{
  timestamp: string;
  method: string;
  success: boolean;
  eventCount?: number;
  error?: string;
}> = [];

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

// POST endpoint to log webhook activity (called by webhook)
export async function POST(request: Request) {
  try {
    const { method, success, eventCount, error } = await request.json();
    
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
    
    return NextResponse.json({ success: true, logged: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}