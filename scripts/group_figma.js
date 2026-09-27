import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));
const canvas = data.document.children[0];

console.log(`Canvas Name: ${canvas.name}`);
console.log(`Total Top-level Objects: ${canvas.children?.length}`);

function getTextFrom(node) {
  let res = [];
  if (node.characters) res.push(node.characters);
  if (node.children) {
    for (const c of node.children) res = res.concat(getTextFrom(c));
  }
  return res;
}

canvas.children?.forEach((child, i) => {
  const texts = getTextFrom(child);
  console.log(`\n=== OBJECT [${i + 1}] Type: ${child.type}, Name: "${child.name}", Id: ${child.id} ===`);
  if (texts.length > 0) {
    console.log(texts.join('\n---\n'));
  } else {
    console.log('(No text inside)');
  }
});
