import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { getPdfById } from '@/lib/db';

async function fetchPdfById(id: string): Promise<Pdf | null> {
  if (id === 'example') {
    return {
      path: '/path/to/example.pdf',
      filename: 'example.pdf',
    };
  }
  return null;
}

interface Pdf {
  path: string;
  filename: string;
}

export async function GET(request: { url: string | URL; }) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }
    
    const pdf = await fetchPdfById(id);
    
    if (!pdf) {
      return NextResponse.json(
        { message: 'PDF not found' },
        { status: 404 }
      );
    }
    
    try {
      const fileBuffer = await readFile(pdf.path);
      
      const response = new NextResponse(fileBuffer);
      
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(pdf.filename)}"`);
      
      return response;
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      return NextResponse.json(
        { message: 'Error reading PDF file', error: fileError instanceof Error ? fileError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return NextResponse.json(
      { 
        message: 'Error downloading PDF', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}