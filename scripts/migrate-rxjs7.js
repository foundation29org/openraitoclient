/**
 * RxJS 6 legacy → RxJS 7 pipeable operators.
 * Usage: node scripts/migrate-rxjs7.js <srcDir>
 */
const fs = require('fs');
const path = require('path');

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Usage: node scripts/migrate-rxjs7.js <srcDir>');
  process.exit(1);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

function ensureImport(content, modulePath, symbols) {
  const needed = symbols.filter((s) => new RegExp(`\\b${s}\\b`).test(content));
  if (!needed.length) return content;

  const esc = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const importRe = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${esc}['"];`);
  const match = content.match(importRe);
  if (match) {
    const merged = [...new Set([...match[1].split(',').map((s) => s.trim()).filter(Boolean), ...needed])];
    return content.replace(importRe, `import { ${merged.join(', ')} } from '${modulePath}';`);
  }
  const insertAt = content.search(/^import/m);
  const line = `import { ${needed.join(', ')} } from '${modulePath}';\n`;
  return insertAt === -1 ? line + content : content.slice(0, insertAt) + line + content.slice(insertAt);
}

function fixImports(content) {
  return content
    .replace(/import \{ Subscription \} from 'rxjs\/Subscription';/g, "import { Subscription } from 'rxjs';")
    .replace(/import \{ Observable \} from 'rxjs\/Observable';/g, "import { Observable } from 'rxjs';")
    .replace(/import \{ Subject \} from 'rxjs\/Subject';/g, "import { Subject } from 'rxjs';")
    .replace(/import \{ Observable \}    from 'rxjs\/Observable';/g, "import { Observable } from 'rxjs';")
    .replace(/import 'rxjs\/add\/[^']+';?\r?\n/g, '');
}

function fixEventsService(content) {
  if (!content.includes("import * as Rx from 'rxjs/Rx'")) return content;
  return `import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EventsService {
  listeners: any;
  eventsSubject: Subject<{ name: string; msg: any }>;
  events: any;

  constructor() {
    this.listeners = {};
    this.eventsSubject = new Subject<{ name: string; msg: any }>();
    this.events = this.eventsSubject.asObservable();

    this.events.subscribe(({ name, msg }) => {
      if (this.listeners[name]) {
        for (const listener of this.listeners[name]) {
          listener(msg);
        }
      }
    });
  }

  on(name: string, listener: (...args: any[]) => void) {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(listener);
  }

  broadcast(name: string, msg: any) {
    this.eventsSubject.next({ name, msg });
  }
}
`;
}

function fixHttpMapChains(content) {
  return content.replace(
    /(\.http\.(?:get|post|put|delete|patch)\([\s\S]*?\))\s*\n(\s*)\.map\(\s*\(\s*res\s*:\s*any\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\(\s*err\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g,
    (_, call, indent, body, errBody) => {
      const err = errBody.trim();
      const errReturn = /\breturn\b/.test(err) ? err : `${err}\n${indent}     return of(null);`;
      return `${call}.pipe(\n${indent}  map((res: any) => {${body}}),\n${indent}  catchError((err) => { ${errReturn} })\n${indent})`;
    }
  );
}

function fixAuthInterceptor(content) {
  if (!content.includes('AuthInterceptor') || !content.includes('.catch((error')) return content;

  content = content.replace(
    /import \{ Observable \} from 'rxjs\/Rx';[\s\S]*?import 'rxjs\/add\/operator\/catch';/,
    "import { Observable, throwError } from 'rxjs';\nimport { catchError } from 'rxjs/operators';"
  );

  content = content.replace(
    /return next\.handle\(authReq\)\s*\n\s*\.catch\(\(error(?:, caught)?\) => \{([\s\S]*?)\}\) as any;/,
    (_, body) => {
      const converted = body.replace(/return Observable\.throw\(error\);/g, 'return throwError(() => error);');
      return `return next.handle(authReq).pipe(\n      catchError((error) => {${converted}})\n    );`;
    }
  );

  return content;
}

function fixRouterChains(content) {
  if (content.includes('this.router.events') && content.includes('.mergeMap((route) => route.data)')) {
    content = content.replace(
      /this\.subscription\s*=\s*this\.router\.events\s*\n\s*\.filter\(/,
      'this.subscription = this.router.events.pipe(\n      filter('
    );
    content = content.replace(
      /\.mergeMap\(\(route\) => route\.data\)\s*\n\s*\.subscribe\(/,
      '.mergeMap((route) => route.data)\n    ).subscribe('
    );
  }

  content = content.replace(/this\.router\.events\.filter\(/g, 'this.router.events.pipe(filter(');
  content = content.replace(
    /this\.router\.events\.pipe\(filter\(([^)]*(?:\([^)]*\)[^)]*)*)\)\)\.subscribe\(/g,
    'this.router.events.pipe(filter($1)).subscribe('
  );

  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = fixImports(content);
  if (path.basename(filePath) === 'events.service.ts') {
    content = fixEventsService(content);
  }
  content = fixAuthInterceptor(content);
  content = fixHttpMapChains(content);
  content = fixRouterChains(content);

  if (content.includes('.pipe(map(') || content.includes('map((res: any)')) {
    content = ensureImport(content, 'rxjs/operators', ['map', 'catchError']);
    content = ensureImport(content, 'rxjs', ['of']);
  }
  if (content.includes('.pipe(filter(') || (content.includes('filter(') && content.includes('NavigationEnd'))) {
    content = ensureImport(content, 'rxjs/operators', ['filter']);
  }
  if (content.includes('mergeMap(')) {
    content = ensureImport(content, 'rxjs/operators', ['mergeMap', 'map', 'filter']);
  }
  if (content.includes('throwError(')) {
    content = ensureImport(content, 'rxjs', ['throwError']);
  }
  if (content.includes('catchError(')) {
    content = ensureImport(content, 'rxjs/operators', ['catchError']);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const files = walk(srcDir);
let changed = 0;
for (const file of files) {
  if (processFile(file)) {
    changed++;
    console.log(path.relative(srcDir, file));
  }
}
console.log(`Updated ${changed} files.`);
