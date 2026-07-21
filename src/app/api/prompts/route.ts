import { NextResponse } from 'next/server';
import promptsData from '@/data/promptsData.json';

export async function GET() {
  try {
    return NextResponse.json(promptsData);
  } catch (error: any) {
    console.error("Lỗi API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
