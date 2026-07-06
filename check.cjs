const fs = require('fs');
const content = fs.readFileSync('pages/HomePage.tsx', 'utf-8');
const lines = content.split('\n');
let balance = 0;
let errors = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') balance++;
    else if (line[j] === '}') {
       balance--;
       if (balance < 0) errors.push(`Negative balance at line ${i+1}`);
    }
  }
}
console.log('Final Balance: ', balance);
console.log('Errors: ', errors);
