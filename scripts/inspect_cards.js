import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));

function listFrames(node) {
  if (node.name && (node.name.includes('Gojo') || node.name.includes('Sukuna') || node.name.includes('Invoker'))) {
    console.log(`[${node.type}] "${node.name}" at (${Math.round(node.absoluteBoundingBox?.x || 0)}, ${Math.round(node.absoluteBoundingBox?.y || 0)}) w:${Math.round(node.absoluteBoundingBox?.width || 0)} h:${Math.round(node.absoluteBoundingBox?.height || 0)}`);
    if (node.children) {
      node.children.forEach(c => console.log(`   └─ [${c.type}] "${c.name}" (${c.fills?.[0]?.type || 'no fill'})`));
    }
  }
  if (node.children) node.children.forEach(listFrames);
}

console.log('=== CREATED HERO CARDS IN FIGMA ===');
listFrames(data.document);
