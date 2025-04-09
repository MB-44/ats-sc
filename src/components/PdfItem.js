'use client';

import { useState, useEffect } from 'react';
import { Download, ExternalLink, Clipboard, Check } from 'lucide-react';

export default function PdfItem({ pdf, keywords }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!pdf.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pdf/extract?id=${pdf.id}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || '');
        }
      } catch (error) {
        console.error('Error fetching PDF content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [pdf.id]);

  const highlightKeywords = (text) => {
    if (!keywords || keywords.length === 0 || !text) {
      return text;
    }

    // Create a single regex with all keywords for highlighting
    const keywordPattern = new RegExp(
      `(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 
      'gi'
    );
    
    const parts = text.split(keywordPattern);
    
    return parts.map((part, i) => {
      // Check if this part is a keyword (case-insensitive)
      const isKeyword = keywords.some(
        keyword => part.toLowerCase() === keyword.toLowerCase()
      );
      
      if (isKeyword) {
        return `<span class="bg-yellow-200 px-1 rounded">${part}</span>`;
      }
      return part;
    }).join('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Extract a preview with context around keywords
  const getContextPreview = () => {
    if (!content || keywords.length === 0) return '';
    
    const preview = [];
    const contextLength = 50; // Characters before and after the match
    
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const start = Math.max(0, match.index - contextLength);
        const end = Math.min(content.length, match.index + keyword.length + contextLength);
        let snippet = content.substring(start, end);
        
        // Add ellipsis if we're not at the beginning or end
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        preview.push(snippet);
        
        // Limit to 3 preview snippets per keyword
        if (preview.length >= 3) break;
      }
    }
    
    return preview.join('\n\n');
  };

  return (
    <div className="px-4 py-3 bg-gray-50 border-t">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex justify-between">
            <h3 className="font-medium">Document Preview</h3>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Copy content"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
              </button>
              <a 
                href={`/api/pdf/download?id=${pdf.id}`}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Download PDF"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {keywords.length > 0 ? (
            <div
              className="p-3 border rounded bg-white max-h-60 overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{ 
                __html: highlightKeywords(getContextPreview() || content.substring(0, 500) + '...') 
              }}
            />
          ) : (
            <div className="p-3 border rounded bg-white max-h-60 overflow-y-auto text-sm">
              {content ? content.substring(0, 500) + '...' : 'No content available'}
            </div>
          )}
        </>
      )}
    </div>
  );
}