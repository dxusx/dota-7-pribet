import fs from 'fs';

const token = process.argv[2] || process.env.FIGMA_TOKEN || '';
const fileKey = 'B7iFAyyV2t5RrlpxQy8UWh';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));

// Find all nodes that are frames or rectangles or top-level objects
const nodeIds = [];
for (const child of data.document.children[0].children || []) {
  if (child.type === 'FRAME' || child.type === 'GROUP' || child.type === 'COMPONENT' || (child.type === 'RECTANGLE' && child.name.includes('изображение'))) {
    nodeIds.push(child.id);
  }
}

console.log('Rendering Node IDs:', nodeIds);

async function downloadImages() {
  if (nodeIds.length === 0) return;
  const idsStr = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(idsStr)}&format=png&scale=2`;
  
  console.log('Calling Figma Image Export API...');
  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token }
  });

  const json = await res.json();
  console.log('Image URLs:', json.images);

  fs.mkdirSync('./public/figma_exports', { recursive: true });

  for (const [id, imgUrl] of Object.entries(json.images || {})) {
    if (!imgUrl) continue;
    console.log(`Downloading node ${id}...`);
    const imgRes = await fetch(imgUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const cleanId = id.replace(':', '_');
    fs.writeFileSync(`./public/figma_exports/node_${cleanId}.png`, buffer);
    console.log(`Saved ./public/figma_exports/node_${cleanId}.png`);
  }
}

downloadImages();
