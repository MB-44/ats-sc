import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPdf } from '@/lib/pdfUtils';
import { savePdfToDatabase } from '@/lib/db';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: { formData: () => any; }) {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const files = formData.getAll('pdfs');
    
    if (files.length === 0) {
      return NextResponse.json(
        { message: 'No PDF files uploaded' },
        { status: 400 }
      );
    }
    
    const uploadedPdfs = [];
    
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        continue;
      }
      
      const id = uuidv4();
      const filename = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(UPLOAD_DIR, id + '.pdf');
      
      await writeFile(filePath, buffer);
      
      const content = await extractTextFromPdf(filePath);
      
      const pdfInfo = {
        id,
        filename,
        path: filePath,
        uploadDate: new Date().toISOString(),
        content
      };
      
      await savePdfToDatabase(pdfInfo);
      uploadedPdfs.push({
        id,
        filename,
        uploadDate: pdfInfo.uploadDate
      });
    }
    
    return NextResponse.json({
      message: 'Files uploaded successfully',
      uploadedPdfs
    });
    
  } catch (error) {
    console.error('Error uploading PDFs:', error);
    return NextResponse.json(
      { message: 'Error uploading files', error: error.message },
      { status: 500 }
    );
  }
}