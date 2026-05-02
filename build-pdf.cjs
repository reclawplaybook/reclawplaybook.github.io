const fs = require('fs');
const md = fs.readFileSync('/home/sch98/my-openclaw/workspace/products/reclaw-playbook-v3.md', 'utf8');
const lines = md.split('\n');

let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#222;font-size:14px;line-height:1.7}
h1{font-size:28px;margin-top:40px}h2{font-size:22px;margin-top:36px;border-bottom:1px solid #ddd;padding-bottom:8px}
h3{font-size:17px;margin-top:24px}
code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:13px;font-family:monospace}
pre{background:#f5f5f5;padding:16px;border-radius:6px;overflow-x:auto;font-size:12px;line-height:1.5}
pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:13px}
th{background:#f9f9f9;font-weight:600}hr{border:none;border-top:1px solid #ddd;margin:32px 0}
ul,ol{margin:8px 0 8px 24px}li{margin:4px 0}
@media print{body{margin:0;max-width:100%}}
</style></head><body>`;

let inCode = false;
let inTable = false;

for (const line of lines) {
  if (line.startsWith('```')) {
    if (inCode) { html += '</code></pre>'; inCode = false; }
    else { html += '<pre><code>'; inCode = true; }
    continue;
  }
  if (inCode) {
    html += line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
    continue;
  }

  // Close table if we're in one and hit a non-table line
  if (inTable && !line.startsWith('|')) {
    html += '</table>';
    inTable = false;
  }

  if (line.startsWith('# ')) {
    html += `<h1>${esc(line.slice(2))}</h1>`;
  } else if (line.startsWith('## ')) {
    html += `<h2>${esc(line.slice(3))}</h2>`;
  } else if (line.startsWith('### ')) {
    html += `<h3>${esc(line.slice(4))}</h3>`;
  } else if (line.startsWith('---')) {
    html += '<hr>';
  } else if (line.startsWith('| ')) {
    const cells = line.split('|').slice(1, -1);
    if (cells.every(c => /^[\s:-]+$/.test(c))) continue; // separator row
    if (!inTable) { html += '<table>'; inTable = true; }
    html += '<tr>' + cells.map(c => `<td>${esc(c.trim())}</td>`).join('') + '</tr>';
  } else if (line.startsWith('- ')) {
    html += `<li>${esc(line.slice(2))}</li>`;
  } else if (line.trim() === '') {
    html += '<br>';
  } else {
    html += `<p>${esc(line)}</p>`;
  }
}

if (inTable) html += '</table>';
html += '</body></html>';

function esc(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

fs.writeFileSync('/home/sch98/reclawplaybook-site/reclaw-playbook-v3.html', html);
console.log('HTML written:', html.length, 'bytes');
