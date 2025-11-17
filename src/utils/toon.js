/**
 * TOON (Token-Optimized Object Notation)
 * Token-efficient data serialization for LLM interactions
 */

/**
 * Encode a JavaScript object to TOON format
 * @param {Object} data - The data to encode
 * @param {Object} options - Encoding options
 * @param {string} options.delimiter - Field delimiter (default: ',')
 * @param {boolean} options.lengthMarker - Add length markers (default: false)
 * @returns {string} TOON-encoded string
 */
export function encode(data, options = {}) {
  const { delimiter = ',', lengthMarker = false } = options;

  function encodeValue(value, key = null) {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return `${key || 'data'}[0]:\n`;

      const firstItem = value[0];
      
      // Array of primitives
      if (typeof firstItem !== 'object' || firstItem === null) {
        const lengthPrefix = lengthMarker ? `#${value.length}` : value.length;
        return `${key || 'data'}[${lengthPrefix}]:\n${value.join('\n')}`;
      }

      // Array of objects
      const fields = Object.keys(firstItem);
      const lengthPrefix = lengthMarker ? `#${value.length}` : value.length;
      let result = `${key || 'data'}[${lengthPrefix}]{${fields.join(delimiter)}}:\n`;
      
      value.forEach(item => {
        const values = fields.map(field => {
          const val = item[field];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && (val.includes(delimiter) || val.includes('\n'))) {
            return `"${val.replace(/"/g, '\\"')}"`;
          }
          return val;
        });
        result += values.join(delimiter) + '\n';
      });
      
      return result.trim();
    }

    // Handle objects
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      const results = [];
      
      entries.forEach(([k, v]) => {
        results.push(encodeValue(v, k));
      });
      
      return results.join('\n\n');
    }

    // Primitives
    return String(value);
  }

  return encodeValue(data);
}

/**
 * Decode a TOON-formatted string back to JavaScript object
 * @param {string} toonStr - TOON-encoded string
 * @param {string} delimiter - Field delimiter (default: ',')
 * @returns {Object} Decoded JavaScript object
 */
export function decode(toonStr, delimiter = ',') {
  if (!toonStr || typeof toonStr !== 'string') {
    throw new Error('Invalid TOON string');
  }

  const lines = toonStr.trim().split('\n');
  const result = {};
  let currentKey = null;
  let currentFields = null;
  let currentData = [];
  let expectedLength = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Check for header line (contains array/object definition)
    const headerMatch = line.match(/^(\w+)\[#?(\d+)\](?:\{([^}]+)\})?:$/);
    
    if (headerMatch) {
      // Save previous data if exists
      if (currentKey && currentData.length > 0) {
        if (currentFields) {
          // Array of objects
          result[currentKey] = currentData.map(row => {
            const obj = {};
            currentFields.forEach((field, idx) => {
              obj[field] = row[idx];
            });
            return obj;
          });
        } else {
          // Array of primitives
          result[currentKey] = currentData;
        }
        currentData = [];
      }

      // Parse new header
      currentKey = headerMatch[1];
      expectedLength = parseInt(headerMatch[2], 10);
      currentFields = headerMatch[3] ? headerMatch[3].split(delimiter) : null;
    } else if (currentKey) {
      // Data line
      if (currentFields) {
        // Parse object row
        const values = parseLine(line, delimiter);
        currentData.push(values);
      } else {
        // Primitive value
        currentData.push(line);
      }
    }
  }

  // Save last data
  if (currentKey && currentData.length > 0) {
    if (currentFields) {
      result[currentKey] = currentData.map(row => {
        const obj = {};
        currentFields.forEach((field, idx) => {
          obj[field] = row[idx];
        });
        return obj;
      });
    } else {
      result[currentKey] = currentData;
    }
  }

  // Validate lengths
  if (expectedLength !== null) {
    const actualLength = result[currentKey]?.length || 0;
    if (actualLength !== expectedLength) {
      console.warn(`TOON length mismatch: expected ${expectedLength}, got ${actualLength}`);
    }
  }

  return result;
}

/**
 * Parse a single data line respecting quoted strings
 */
function parseLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      values.push(parseValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    values.push(parseValue(current.trim()));
  }
  
  return values;
}

/**
 * Parse a single value (convert numbers, booleans, etc.)
 */
function parseValue(value) {
  if (value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  
  // Remove quotes if present
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  
  // Try to parse as number
  const num = Number(value);
  if (!isNaN(num) && value !== '') {
    return num;
  }
  
  return value;
}

/**
 * Check if a string is valid TOON format
 */
export function isTOON(str) {
  if (!str || typeof str !== 'string') return false;
  
  // Check for TOON header pattern
  const headerPattern = /^\w+\[#?\d+\](?:\{[^}]+\})?:/m;
  return headerPattern.test(str);
}

/**
 * Estimate token savings compared to JSON
 */
export function estimateTokenSavings(data) {
  const jsonStr = JSON.stringify(data);
  const toonStr = encode(data);
  
  const jsonTokens = jsonStr.length / 4; // Rough estimate: 1 token ≈ 4 chars
  const toonTokens = toonStr.length / 4;
  
  const savings = ((jsonTokens - toonTokens) / jsonTokens) * 100;
  
  return {
    jsonLength: jsonStr.length,
    toonLength: toonStr.length,
    jsonTokens: Math.ceil(jsonTokens),
    toonTokens: Math.ceil(toonTokens),
    savingsPercent: Math.round(savings * 100) / 100,
    savingsTokens: Math.ceil(jsonTokens - toonTokens)
  };
}

export default { encode, decode, isTOON, estimateTokenSavings };
