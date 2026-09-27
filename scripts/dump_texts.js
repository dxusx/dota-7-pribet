import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./figma_file.json', 'utf8'));

function collectAll(node) {
  let list = [];
  if (node.characters) {
    list.push({ id: node.id, name: node.name, type: node.type, text: node.characters });
  }
  if (node.children) {
    for (const c of node.children) {
      list = list.concat(collectAll(c));
    }
  }
  return list;
}

const list = collectAll(data.document);
console.log(`TOTAL TEXT NODES: ${list.length}`);
list.forEach((item, i) => {
  console.log(`--- [${i + 1}] (id: ${item.id}) "${item.name}" ---`);
  console.log(item.text);
});
