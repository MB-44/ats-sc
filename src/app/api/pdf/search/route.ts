import { NextResponse } from 'next/server';
import { searchPdfsByKeywords } from '@/lib/db';

export async function POST(request: { json: () => any; }) {
  try {
    const data = await request.json();
    const { keywords = [], filters = {} } = data;

    const results = await searchPdfsByKeywords(Array.isArray(keywords) ? keywords : [], filters);
    
    return NextResponse.json({
      message: `Found ${results.length} matching documents`,
      results
    });
  } catch (error) {
    console.error('Error searching PDFs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Error searching PDFs', error: errorMessage },
      { status: 500 }
    );
  }
}