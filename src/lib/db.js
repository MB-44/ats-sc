import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { countKeywordMatches, extractContextSnippets } from './pdfUtils';

// Initialize database
async function openDb() {
  return open({
    filename: './ats-database.sqlite',
    driver: sqlite3.Database
  });
}

// Initialize database schema
async function initDb() {
  const db = await openDb();
  
  // Create PDFs table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pdfs (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      content TEXT
    );
  `);
  
  return db;
}

/**
 * Save PDF information to database
 * @param {Object} pdfInfo - PDF information object
 * @returns {Promise<void>}
 */
export async function savePdfToDatabase(pdfInfo) {
  const db = await initDb();
  
  try {
    await db.run(
      `INSERT INTO pdfs (id, filename, filepath, upload_date, content) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        pdfInfo.id,
        pdfInfo.filename,
        pdfInfo.path,
        pdfInfo.uploadDate,
        pdfInfo.content || ''
      ]
    );
  } finally {
    await db.close();
  }
}

/**
 * Get all PDFs from database (without content for listing)
 * @returns {Promise<Array>} - Array of PDF objects
 */
export async function getAllPdfs() {
  const db = await initDb();
  
  try {
    const pdfs = await db.all(
      `SELECT id, filename, upload_date as uploadDate FROM pdfs ORDER BY upload_date DESC`
    );
    
    return pdfs;
  } finally {
    await db.close();
  }
}

/**
 * Get a specific PDF by ID
 * @param {string} id - PDF ID
 * @returns {Promise<Object|null>} - PDF object or null if not found
 */
export async function getPdfById(id) {
  const db = await initDb();
  
  try {
    const pdf = await db.get(
      `SELECT id, filename, filepath as path, upload_date as uploadDate, content 
       FROM pdfs WHERE id = ?`,
      [id]
    );
    
    return pdf || null;
  } finally {
    await db.close();
  }
}

/**
 * Search PDFs by keywords
 * @param {string[]} keywords - Array of keywords to search for
 * @returns {Promise<Array>} - Array of matching PDF objects with match counts
 */
export async function searchPdfsByKeywords(keywords, filters = {}) {
  const db = await initDb();
  
  try {
    // Get all PDFs
    const pdfs = await db.all(
      `SELECT id, filename, filepath as path, upload_date as uploadDate, content FROM pdfs`
    );
    
    const matchesFilters = (content) => {
      if (!filters || Object.keys(filters).length === 0) return true;
      const lower = content.toLowerCase();
      for (const key of Object.keys(filters)) {
        const val = String(filters[key] || '').toLowerCase();
        if (val && !lower.includes(val)) {
          return false;
        }
      }
      return true;
    };

    // Filter and rank PDFs by keyword matches and custom filters
    const results = pdfs
      .map(pdf => {
        const { totalMatches, keywordCounts } = countKeywordMatches(pdf.content, keywords);
        const snippets = extractContextSnippets(pdf.content, keywords);

        return {
          id: pdf.id,
          filename: pdf.filename,
          uploadDate: pdf.uploadDate,
          content: pdf.content,
          matchCount: totalMatches,
          keywordMatches: keywordCounts,
          matchSnippets: snippets.slice(0, 5)
        };
      })
      .filter(pdf => matchesFilters(pdf.content) && (keywords.length === 0 || pdf.matchCount > 0))
      .sort((a, b) => b.matchCount - a.matchCount)
      .map(({ content, ...rest }) => rest);
    
    return results;
  } finally {
    await db.close();
  }
}

/**
 * Delete a PDF by ID
 * @param {string} id - PDF ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
export async function deletePdf(id) {
  const db = await initDb();
  
  try {
    const result = await db.run(
      `DELETE FROM pdfs WHERE id = ?`,
      [id]
    );
    
    return result.changes > 0;
  } finally {
    await db.close();
  }
}