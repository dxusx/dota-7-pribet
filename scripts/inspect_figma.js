import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));

function walk(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}- [${node.type}] "${node.name}" (id: ${node.id})`);
  if (node.characters) {
    console.log(`${indent}  TEXT: "${node.characters}"`);
  }
  if (node.fills && node.fills.length > 0) {
    const f = node.fills[0];
    if (f.color) {
      const r = Math.round(f.color.r * 255);
      const g = Math.round(f.color.g * 255);
      const b = Math.round(f.color.b * 255);
      console.log(`${indent}  COLOR: rgb(${r},${g},${b})`);
    }
  }
  if (node.children) {
    for (const child of node.children) {
      walk(child, depth + 1);
    }
  }
}

console.log('=== FIGMA DOCUMENT TREE ===');
walk(data.document);
