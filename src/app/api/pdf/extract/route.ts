import { NextResponse } from 'next/server';
import { getPdfById, getAllPdfs } from '@/lib/db';

interface Pdf {
  id: string;
  filename: string;
  uploadDate: string;
  content?: string;
}
export async function GET(request: { url: string | URL; }) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const pdf = await getPdfById(id) as Pdf;
      
      if (!pdf) {
        return NextResponse.json(
          { message: 'PDF not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        filename: pdf.filename,
        uploadDate: pdf.uploadDate,
        content: pdf.content
      });
    } else {
      const pdfs = await getAllPdfs() as Pdf[];
      
      return NextResponse.json({
        pdfs: pdfs.map(pdf => ({
          id: pdf.id,
          filename: pdf.filename,
          uploadDate: pdf.uploadDate
        }))
      });
    }
  } catch (error) {
    console.error('Error extracting PDF info:', error);
    return NextResponse.json(
      { 
        message: 'Error retrieving PDF data', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}