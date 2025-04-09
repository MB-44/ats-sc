import { NextResponse } from 'next/server';
import { searchPdfsByKeywords } from '@/lib/db';

export async function POST(request: { json: () => any; }) {
  try {
    const data = await request.json();
    const { keywords } = data;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { message: 'No keywords provided for search' },
        { status: 400 }
      );
    }
    
    const results = await searchPdfsByKeywords(keywords);
    
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