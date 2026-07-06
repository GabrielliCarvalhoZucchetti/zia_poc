const fs = require('fs');
const content = fs.readFileSync('pages/HomePage.tsx', 'utf-8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') balance++;
    else if (line[j] === '}') balance--;
  }
}
console.log('Balance: ', balance);
