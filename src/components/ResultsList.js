'use client';

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
import PdfItem from './PdfItem';

export default function ResultsList({ pdfs, keywords, isFiltered, isLoading }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Processing...</p>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50">
        <FileText className="h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">
          {isFiltered 
            ? 'No PDFs match your keywords' 
            : 'No PDFs uploaded yet. Start by uploading some files.'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <div className="font-medium">
          {isFiltered 
            ? `Filtered Results (${pdfs.length})`
            : `All PDFs (${pdfs.length})`}
        </div>
        {isFiltered && keywords.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Search className="h-4 w-4 mr-1" />
            <span>Filtered by: {keywords.join(', ')}</span>
          </div>
        )}
      </div>
      
      <ul className="divide-y">
        {pdfs.map((pdf) => (
          <li key={pdf.id} className="hover:bg-gray-50">
            <div 
              className="px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpanded(pdf.id)}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <div className="font-medium">{pdf.filename}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(pdf.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div>
                {isFiltered && (
                  <span className="mr-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {pdf.matchCount} matches
                  </span>
                )}
                {expandedId === pdf.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedId === pdf.id && (
              <PdfItem pdf={pdf} keywords={keywords} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}