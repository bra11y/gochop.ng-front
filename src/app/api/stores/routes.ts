// This file is deprecated - using Rails API backend instead
// All API calls now go through Rails backend at localhost:3001/api/v1
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'API moved to Rails backend at /api/v1/stores' }, 
    { status: 410 }
  );
}

export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'API moved to Rails backend at /api/v1/stores' }, 
    { status: 410 }
  );
}