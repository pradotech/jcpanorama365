/**
 * Script de pós-build para compatibilidade com navegadores legados (Chrome no Windows 7):
 * 1. Remove @layer wrappers e declarações (Chrome < 99 ignora todo CSS dentro de @layer)
 * 2. Remove "in oklab" / "in oklch" das posições de gradiente (Chrome < 111 invalida linear-gradient)
 * 3. Remove declarações @property não suportadas
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DIST_DIR = join(import.meta.dirname, '..', 'dist', 'assets');

async function unwrapLayers(cssContent) {
  // 1. Remove @layer declarations like: @layer properties, theme, base, components, utilities;
  let result = cssContent.replace(/@layer\s+[\w\s,]+;/g, '');
  
  // 2. Unwrap @layer blocks: @layer name { ... } → ...
  let output = '';
  let i = 0;
  
  while (i < result.length) {
    if (result.substring(i, i + 6) === '@layer') {
      let braceStart = result.indexOf('{', i);
      if (braceStart === -1) {
        output += result.substring(i);
        break;
      }
      
      let depth = 1;
      let j = braceStart + 1;
      while (j < result.length && depth > 0) {
        if (result[j] === '{') depth++;
        else if (result[j] === '}') depth--;
        j++;
      }
      
      let innerContent = result.substring(braceStart + 1, j - 1);
      output += innerContent;
      i = j;
    } else {
      output += result[i];
      i++;
    }
  }
  
  // 3. Remove 'in oklab' e 'in oklch' das especificações de gradiente moderno
  output = output.replace(/\s+in\s+oklab/g, '');
  output = output.replace(/\s+in\s+oklch/g, '');
  output = output.replace(/\s+in\s+srgb/g, '');

  // 4. Remove blocos @property que navegadores legados não compreendem
  output = output.replace(/@property\s+[^{]+{[^}]+}/g, '');

  // 5. Garantir que as variáveis essenciais do Tailwind estejam disponíveis fora de @supports
  const baseOverrides = '*,:before,:after{--tw-border-style:solid;--tw-translate-x:0;--tw-translate-y:0;--tw-scale-x:1;--tw-scale-y:1;}';
  output = baseOverrides + output;

  // 6. Adicionar fallback para color-mix (Chrome < 111 no Windows 7 não suporta color-mix)
  output = output.replace(
    /([a-zA-Z-]+):(color-mix\((?:in\s+[\w]+,\s*)?((?:var\([^)]+\)|currentcolor|#[0-9a-fA-F]+|[a-zA-Z]+))(?:\s+[\d.]+%?)?,\s*transparent\))/g,
    '$1:$3;$1:$2'
  );

  return output;
}

async function main() {
  const files = await readdir(DIST_DIR);
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  for (const file of cssFiles) {
    const filePath = join(DIST_DIR, file);
    const content = await readFile(filePath, 'utf-8');
    
    const unwrapped = await unwrapLayers(content);
    await writeFile(filePath, unwrapped, 'utf-8');
    console.log(`✅ CSS pós-processado para compatibilidade legada: ${file}`);
    console.log(`   Antes: ${content.length} bytes → Depois: ${unwrapped.length} bytes`);
  }
}

main().catch(console.error);
