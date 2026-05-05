import fs from "fs";
import path from "path";

function walkDir(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

function processFile(filepath: string) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Replace imports
  content = content.replace(/import\s+\{\s*adminDb\s*\}\s+from\s+"@\/lib\/firebase\/admin";/g, 'import { getAdminDb } from "@/lib/firebase/admin";');
  content = content.replace(/import\s+\{\s*adminAuth\s*\}\s+from\s+"@\/lib\/firebase\/admin";/g, 'import { getAdminAuth } from "@/lib/firebase/admin";');
  content = content.replace(/import\s+\{\s*adminAuth,\s*adminDb\s*\}\s+from\s+"@\/lib\/firebase\/admin";/g, 'import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";');
  content = content.replace(/import\s+\{\s*adminDb,\s*adminAuth\s*\}\s+from\s+"@\/lib\/firebase\/admin";/g, 'import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";');

  // Replace usages
  content = content.replace(/adminDb/g, 'getAdminDb()');
  content = content.replace(/adminAuth/g, 'getAdminAuth()');

  // Fix imports that were affected by the usage replacement
  content = content.replace(/getAdminDb\(\)/g, 'getAdminDb'); // This undoes the function call for ALL instances
  // We need to be more careful.
  
  // Let's restore the content and use a better regex
  content = original;
  content = content.replace(/import \{([^}]+)\} from "@\/lib\/firebase\/admin";/g, (match, p1) => {
    let imports = p1.split(',').map((s: string) => s.trim());
    imports = imports.map((s: string) => s === 'adminDb' ? 'getAdminDb' : s === 'adminAuth' ? 'getAdminAuth' : s);
    return `import { ${imports.join(', ')} } from "@/lib/firebase/admin";`;
  });

  // Replace usages, but avoid replacing the import statement itself
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.includes('from "@/lib/firebase/admin"')) return line;
    let res = line.replace(/\badminDb\b/g, 'getAdminDb()');
    res = res.replace(/\badminAuth\b/g, 'getAdminAuth()');
    return res;
  });
  content = newLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filepath}`);
  }
}

const targetDirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'lib'),
  path.join(__dirname, 'actions')
];

targetDirs.forEach(dir => walkDir(dir, processFile));
console.log("Done");
