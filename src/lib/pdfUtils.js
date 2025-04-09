import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPdf(filePath) {
  try {
    // Read the PDF file as buffer
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const data = await pdfParse(dataBuffer);
    
    // Return the text content
    return data.text || '';
  } catch (error) {
    console.error(`Error extracting text from PDF: ${filePath}`, error);
    throw error;
  }
}

/**
 * Count keyword occurrences in text
 * @param {string} text - Text to search in
 * @param {string[]} keywords - Array of keywords to search for
 * @returns {Object} - Count of each keyword and total matches
 */
export function countKeywordMatches(text, keywords) {
  const result = {
    totalMatches: 0,
    keywordCounts: {}
  };
  
  if (!text || !keywords || keywords.length === 0) {
    return result;
  }
  
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Count occurrences of each keyword
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Use regex to find all occurrences (whole word matches)
    const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi');
    const matches = (lowerText.match(regex) || []).length;
    
    result.keywordCounts[keyword] = matches;
    result.totalMatches += matches;
  }
  
  return result;
}

/**
 * Extract context around keyword matches
 * @param {string} text - Full text content
 * @param {string[]} keywords - Keywords to find
 * @param {number} contextLength - Number of characters before and after match
 * @returns {string[]} - Array of text snippets with context
 */
export function extractContextSnippets(text, keywords, contextLength = 100) {
  const snippets = [];
  
  if (!text || !keywords || keywords.length === 0) {
    return snippets;
  }
  
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - contextLength);
      const end = Math.min(text.length, match.index + keyword.length + contextLength);
      
      let snippet = text.substring(start, end);
      
      // Add ellipsis if we're not at the beginning or end
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      snippets.push(snippet);
      
      // Limit to 3 snippets per keyword
      if (snippets.length >= 3) break;
    }
  }
  
  return snippets;
}