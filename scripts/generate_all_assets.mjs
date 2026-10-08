import fs from 'node:fs';
import path from 'node:path';

// Clean procedural SVG generator: replaces all text emojis with vector geometries
export function generateSkillIcons() {
  const filePath = path.resolve(process.cwd(), 'src/assets/skillIcons.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text emoji elements with vector runes
  content = content.replace(/<text x="40" y="4[46]" font-size="26" text-anchor="middle">[\s\S]*?<\/text>/gu, () => {
    return `<g transform="translate(40,36)"><circle r="12" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity="0.8"/><polygon points="0,-8 7,5 -7,5" fill="currentColor" fill-opacity="0.9"/></g>`;
  });

  // Strip any remaining pictographics
  content = content.replace(/\p{Extended_Pictographic}/gu, '');

  fs.writeFileSync(filePath, content, 'utf8');
}

generateSkillIcons();
