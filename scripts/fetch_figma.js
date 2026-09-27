// Utility to fetch Figma file and export images/components
const fileKey = process.argv[2] || 'B7iFAyyV2t5RrlpxQy8UWh';
const token = process.env.FIGMA_TOKEN || process.argv[3];

if (!token) {
  console.log('Usage: node fetch_figma.js [fileKey] [figma_personal_access_token]');
  console.log('Or set FIGMA_TOKEN environment variable.');
  process.exit(1);
}

async function fetchFigma() {
  try {
    console.log(`Fetching Figma file: ${fileKey}...`);
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Success! File Name:', data.name);
    console.log('Last Modified:', data.lastModified);
    console.log('Number of Pages:', data.document?.children?.length);
    
    // Save raw json for inspection
    const fs = await import('fs');
    fs.writeFileSync('./figma_file.json', JSON.stringify(data, null, 2));
    console.log('Saved to figma_file.json');
  } catch (err) {
    console.error('Error fetching Figma:', err.message);
  }
}

fetchFigma();
