import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));
const canvas = data.document.children[0];

// Let's inspect all nodes and their coordinates (x, y) to group elements that belong together
const items = [];

function collect(node) {
  if (node.type === 'TEXT') {
    items.push({
      type: 'TEXT',
      id: node.id,
      name: node.name,
      text: node.characters,
      x: node.absoluteBoundingBox?.x || 0,
      y: node.absoluteBoundingBox?.y || 0,
      w: node.absoluteBoundingBox?.width || 0,
      h: node.absoluteBoundingBox?.height || 0,
    });
  } else if (node.type === 'RECTANGLE' && node.name.includes('изображение')) {
    items.push({
      type: 'IMAGE',
      id: node.id,
      name: node.name,
      x: node.absoluteBoundingBox?.x || 0,
      y: node.absoluteBoundingBox?.y || 0,
      w: node.absoluteBoundingBox?.width || 0,
      h: node.absoluteBoundingBox?.height || 0,
    });
  }

  if (node.children) {
    for (const c of node.children) collect(c);
  }
}

collect(canvas);

// Sort by Y coordinate then X
items.sort((a, b) => a.y - b.y || a.x - b.x);

console.log(`Found ${items.length} items on canvas. Printing all:`);
items.forEach(item => {
  if (item.type === 'IMAGE') {
    console.log(`\n[IMAGE at y=${Math.round(item.y)}, x=${Math.round(item.x)}] id: ${item.id} name: ${item.name}`);
  } else {
    console.log(`\n[TEXT at y=${Math.round(item.y)}, x=${Math.round(item.x)}] id: ${item.id}\n${item.text}`);
  }
});
