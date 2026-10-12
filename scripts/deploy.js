import { execSync } from 'node:child_process';

console.log('[DEPLOY] Staging dist for gh-pages...');
execSync('git add -f dist', { stdio: 'inherit' });
const tree = execSync('git write-tree --prefix=dist').toString().trim();
execSync('git reset HEAD dist', { stdio: 'ignore' });
const commit = execSync(`git commit-tree ${tree} -m "deploy to gh-pages"`).toString().trim();
execSync(`git update-ref refs/heads/gh-pages ${commit}`);
console.log(`[DEPLOY] Pushing gh-pages (${commit.slice(0, 7)})...`);
execSync('git push -f origin gh-pages', { stdio: 'inherit' });
console.log('[DEPLOY] Successfully deployed to gh-pages.');
