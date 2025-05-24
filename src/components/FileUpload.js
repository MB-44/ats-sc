'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, Check } from 'lucide-react';

export default function FileUpload({ onUpload, isLoading }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    // Filter for PDF files
    const pdfFiles = acceptedFiles.filter(
      file => file.type === 'application/pdf'
    );
    
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are accepted');
    } else {
      setError('');
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 200,
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setError('Please add at least one PDF file');
      return;
    }
    
    onUpload(files);
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive 
            ? 'Drop the PDF files here...' 
            : 'Drag and drop PDF files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted</p>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-sm mb-2">Selected Files ({files.length})</h3>
          <ul className="max-h-60 overflow-y-auto border rounded-md divide-y">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isLoading}
        className={`w-full mt-4 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${isLoading || files.length === 0 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" /> Upload Files
          </>
        )}
      </button>
    </div>
  );
}