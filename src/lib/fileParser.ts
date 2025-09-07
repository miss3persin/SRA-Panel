
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ProcessedStudentResult } from '@/types';

export interface ParseResult {
  data: ProcessedStudentResult[];
  errors: (Papa.ParseError | Error)[];
}

const REQUIRED_COLUMNS: (keyof ProcessedStudentResult)[] = [
  'Matric No',
  'Student Name',
  'Course Code',
  'Credit Units',
  'Grade',
  'GP',
  'GPA',
  'CGPA'
];

// Normalize header to handle variations like "Matric No." vs "Matric No" and "Credit Units" vs "Credit Unit"
const normalizeHeader = (header: string) => {
    let normalized = header.trim().replace(/\./g, ''); // Remove periods
    if (normalized.toLowerCase() === 'credit unit') return 'Credit Units';
    if (normalized.toLowerCase() === 'quality point') return 'Quality Points';
    if (normalized.toLowerCase() === 'student name') return 'Student Name';
    if (normalized.toLowerCase() === 'course code') return 'Course Code';
    if (normalized.toLowerCase() === 'course title') return 'Course Title';
    if (normalized.toLowerCase() === 'matric no') return 'Matric No';
    return normalized;
};


const processRow = (row: any, index: number): ProcessedStudentResult | null => {
    // Basic validation to ensure key fields exist
    if (!row['Matric No'] || !row['Student Name'] || !row['Course Code']) {
        return null;
    }
    const matricNo = String(row['Matric No']);
    const courseCode = String(row['Course Code']);

    return {
      'Matric No': matricNo,
      'Student Name': String(row['Student Name']),
      'Course Code': courseCode,
      'Course Title': String(row['Course Title'] || ''),
      'Credit Units': Number(row['Credit Units']) || 0,
      'Grade': String(row['Grade'] || ''),
      'GP': Number(row.GP) || 0,
      'GPA': Number(row.GPA) || 0,
      'CGPA': Number(row.CGPA) || 0,
      'Quality Points': Number(row['Quality Points']) || 0,
      'Level': row['Level'] ? String(row['Level']) : undefined,
      'Semester': row['Semester'] ? String(row['Semester']) : undefined,
      'id': `${matricNo}-${courseCode}-${index}`, // Consistent unique ID
    };
};

const validateHeaders = (headers: string[]): string[] => {
    const normalizedHeaders = headers.map(normalizeHeader);
    const missingColumns = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(normalizeHeader(col)));
    return missingColumns;
};

// --- Parsers for specific file types ---

const parseCsv = (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Set to false to handle all data as strings initially
      transformHeader: normalizeHeader,
      complete: (results) => {
        const { data, errors, meta } = results;
        const validationErrors: Error[] = [];

        if (data.length === 0) {
          return resolve({ data: [], errors: [...errors, new Error("CSV file is empty or contains no data.")] });
        }
        
        // meta.fields are the original headers before transformation
        const missingColumns = validateHeaders(meta.fields || []);
        if (missingColumns.length > 0) {
          validationErrors.push(new Error(`Missing required columns: ${missingColumns.join(', ')}.`));
        }

        const processedData: ProcessedStudentResult[] = data
          .map((row, index) => processRow(row, index))
          .filter((row): row is ProcessedStudentResult => row !== null);

        resolve({ data: processedData, errors: [...errors, ...validationErrors] });
      },
      error: (error: Papa.ParseError) => {
        resolve({ data: [], errors: [error] });
      },
    });
  });
};

const parseXlsx = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) {
          return reject(new Error("Could not read the file."));
        }
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
            // raw: false ensures dates are formatted, though we don't expect them here
        });

        if (jsonData.length === 0) {
            return resolve({data: [], errors: [new Error("Excel sheet is empty.")]});
        }
        
        // Use the headers from the parsed data to validate
        const originalHeaders = Object.keys(jsonData[0]);
        const missingColumns = validateHeaders(originalHeaders);
        const validationErrors: Error[] = [];
        if (missingColumns.length > 0) {
          validationErrors.push(new Error(`Missing required columns: ${missingColumns.join(', ')}.`));
        }
        
        // Normalize headers in the data itself
        const normalizedJsonData = jsonData.map(row => {
            const newRow: {[key: string]: any} = {};
            for (const key in row) {
                newRow[normalizeHeader(key)] = row[key];
            }
            return newRow;
        })

        const processedData: ProcessedStudentResult[] = normalizedJsonData
          .map((row, index) => processRow(row, index))
          .filter((row): row is ProcessedStudentResult => row !== null);
          
        resolve({ data: processedData, errors: validationErrors });

      } catch (error) {
        if (error instanceof Error) {
            resolve({ data: [], errors: [error] });
        } else {
            resolve({ data: [], errors: [new Error("An unknown error occurred during XLSX parsing.")] });
        }
      }
    };
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsArrayBuffer(file);
  });
};


// --- Unified Parser ---

export function parseStudentDataFile(file: File): Promise<ParseResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv' || file.type === 'text/csv') {
    return parseCsv(file);
  } else if (fileExtension === 'xlsx' || file.type.includes('spreadsheet') || file.type.includes('excel')) {
    return parseXlsx(file);
  } else {
    return Promise.resolve({ data: [], errors: [new Error(`Unsupported file type: .${fileExtension}`)] });
  }
}
