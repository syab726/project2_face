import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello World!',
    timestamp: new Date().toISOString(),
    status: 'working'
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST method works!',
    timestamp: new Date().toISOString()
  });
}