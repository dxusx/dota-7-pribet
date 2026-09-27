import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));
const canvas = data.document.children[0];

const items = [];
function collect(node) {
  if (node.type === 'TEXT') {
    items.push({
      type: 'TEXT',
      id: node.id,
      name: node.name,
      text: node.characters,
      x: Math.round(node.absoluteBoundingBox?.x || 0),
      y: Math.round(node.absoluteBoundingBox?.y || 0)
    });
  } else if (node.type === 'RECTANGLE' && node.name.includes('изображение')) {
    items.push({
      type: 'IMAGE',
      id: node.id,
      name: node.name,
      x: Math.round(node.absoluteBoundingBox?.x || 0),
      y: Math.round(node.absoluteBoundingBox?.y || 0)
    });
  }
  if (node.children) {
    for (const c of node.children) collect(c);
  }
}

collect(canvas);

// Cluster by X coordinate (threshold ~1500px)
items.sort((a, b) => a.x - b.x);

const columns = [];
let currentCol = null;

items.forEach(item => {
  if (!currentCol || Math.abs(item.x - currentCol.avgX) > 2000) {
    currentCol = { avgX: item.x, items: [] };
    columns.push(currentCol);
  }
  currentCol.items.push(item);
  currentCol.avgX = currentCol.items.reduce((sum, it) => sum + it.x, 0) / currentCol.items.length;
});

console.log(`FOUND ${columns.length} HERO COLUMNS IN FIGMA!\n`);

columns.forEach((col, idx) => {
  // Sort items inside column by Y coordinate
  col.items.sort((a, b) => a.y - b.y);
  console.log(`========================================`);
  console.log(`HERO COLUMN [${idx + 1}] (Approx X: ${Math.round(col.avgX)}):`);
  console.log(`========================================`);
  col.items.forEach(it => {
    if (it.type === 'IMAGE') {
      console.log(`[IMG] ${it.name} (id: ${it.id})`);
    } else {
      console.log(`[TEXT (y=${it.y})]:\n${it.text}\n`);
    }
  });
});
