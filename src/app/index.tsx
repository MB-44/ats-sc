'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import KeywordInput from '@/components/KeywordInput';
import ResultsList from '@/components/ResultsList';

export default function Home() {
  const [pdfs, setPdfs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await fetch('/api/pdf/extract');
        if (response.ok) {
          const data = await response.json();
          setPdfs(data.pdfs);
        }
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      }
    };

    fetchPdfs();
  }, []);

  useEffect(() => {
    const searchPdfs = async () => {
      if (keywords.length === 0) {
        setFilteredPdfs([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/pdf/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keywords }),
        });

        if (response.ok) {
          const data = await response.json();
          setFilteredPdfs(data.results);
          setMessage(`Found ${data.results.length} matching documents`);
        } else {
          setMessage('Error searching PDFs');
        }
      } catch (error) {
        console.error('Error searching PDFs:', error);
        setMessage('Error searching PDFs');
      } finally {
        setIsLoading(false);
      }
    };

    searchPdfs();
  }, [keywords]);

  const handleFileUpload = async (uploadedFiles: any[]) => {
    setIsLoading(true);
    setMessage('Uploading files...');
    
    try {
      const formData = new FormData();
      
      uploadedFiles.forEach(file => {
        formData.append('pdfs', file);
      });
      
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setPdfs((prevPdfs: any) => [...prevPdfs, ...data.uploadedPdfs]);
        setMessage(`Successfully uploaded ${data.uploadedPdfs.length} files`);
      } else {
        const error = await response.json();
        setMessage(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage('Upload failed due to an error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ATS PDF Filtering System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload PDF Files</h2>
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
          
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              {message}
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Enter Keywords</h2>
            <KeywordInput 
              onKeywordsChange={setKeywords}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <ResultsList 
            pdfs={filteredPdfs.length > 0 ? filteredPdfs : pdfs} 
            keywords={keywords}
            isFiltered={filteredPdfs.length > 0}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
}