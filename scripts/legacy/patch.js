const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/workspaces/Projects/English/apps/web/app/(admin)/admin');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Basic camelCase fixes for SVGs and DOM
  content = content.replace(/stroke-width=/g, 'strokeWidth=');
  content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
  content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  content = content.replace(/fill-rule=/g, 'fillRule=');
  content = content.replace(/clip-rule=/g, 'clipRule=');
  content = content.replace(/tabindex=/g, 'tabIndex=');
  content = content.replace(/xmlns:xlink=/g, 'xmlnsXlink=');
  content = content.replace(/autocomplete=/g, 'autoComplete=');
  content = content.replace(/autofocus=/g, 'autoFocus=');
  content = content.replace(/readonly=/g, 'readOnly=');
  
  fs.writeFileSync(file, content);
});
console.log('Patched ' + files.length + ' files');
