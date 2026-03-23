
import fs from 'fs';
const path = 'c:\\Users\\Micro-Tech\\Desktop\\3\\src\\App.jsx';

let content = fs.readFileSync(path, 'utf8');
const target = '                     </div>\n                  </div>\n </div>\n                     </div>';
if (content.includes(target)) {
    console.log('Found exact messy target. Replacing...');
    content = content.replace(target, '                     </div>\n                  </div>\n                </div>');
    fs.writeFileSync(path, content);
    console.log('Fixed!');
} else {
    console.log('Target not found.');
    // Try without spaces at start of the problematic line
    const target2 = '</div>\n </div>';
    if (content.includes(target2)) {
         content = content.replace(target2, '</div>');
         fs.writeFileSync(path, content);
         console.log('Fixed target 2!');
    }
}
