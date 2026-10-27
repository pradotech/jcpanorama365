/**
 * Script de Deploy Automatizado via FTP para HostGator
 * Execução: npm run deploy
 */

import { Client } from 'basic-ftp';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Carregar variáveis de ambiente de arquivo .env ou .env.deploy
function loadEnv() {
  const envFiles = ['.env.deploy', '.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = join(process.cwd(), file);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        });
      } catch (err) {
        // Ignora erro de leitura
      }
    }
  }
}

loadEnv();

const HOST = process.env.FTP_HOST;
const PORT = parseInt(process.env.FTP_PORT || '21', 10);
const USER = process.env.FTP_USER;
const PASSWORD = process.env.FTP_PASSWORD;
const REMOTE_DIR = process.env.FTP_REMOTE_DIR || 'public_html';
const SECURE_RAW = process.env.FTP_SECURE;
const SECURE = SECURE_RAW === 'true' || SECURE_RAW === '1';

async function deploy() {
  console.log('🚀 Iniciando processo de deploy via FTP para HostGator...\n');

  // Validação de credenciais
  if (!HOST || !USER || !PASSWORD) {
    console.error('❌ ERRO: Credenciais de FTP não encontradas!');
    console.error('👉 Crie um arquivo .env.deploy na raiz do projeto com:');
    console.error('   FTP_HOST=ftp.seudominio.com.br');
    console.error('   FTP_USER=seu_usuario');
    console.error('   FTP_PASSWORD=sua_senha');
    console.error('   FTP_REMOTE_DIR=public_html');
    console.error('   FTP_SECURE=true\n');
    console.error('(Veja o modelo em .env.deploy.example)');
    process.exit(1);
  }

  const distPath = join(process.cwd(), 'dist');
  if (!existsSync(distPath) || !existsSync(join(distPath, 'index.html'))) {
    console.error('❌ ERRO: A pasta dist/ não foi encontrada ou não possui index.html.');
    console.error('   Execute "npm run build" antes de fazer o deploy.');
    process.exit(1);
  }

  const client = new Client(30000); // 30s timeout

  try {
    console.log(`🔌 Conectando ao servidor FTP: ${HOST}:${PORT} (${USER})...`);

    // Tenta conexão (com suporte a TLS/FTPS seguro e fallback caso certificado seja autoassinado)
    try {
      await client.access({
        host: HOST,
        port: PORT,
        user: USER,
        password: PASSWORD,
        secure: SECURE,
        secureOptions: {
          rejectUnauthorized: false, // Permite certificados cPanel da HostGator
        },
      });
    } catch (tlsErr) {
      if (SECURE) {
        console.warn('⚠️ Falha com FTPS (TLS). Tentando conexão FTP padrão...');
        await client.access({
          host: HOST,
          port: PORT,
          user: USER,
          password: PASSWORD,
          secure: false,
        });
      } else {
        throw tlsErr;
      }
    }

    console.log('✅ Conexão FTP estabelecida com sucesso!');
    if (REMOTE_DIR && REMOTE_DIR !== '/' && REMOTE_DIR !== '.') {
      console.log(`📁 Navegando para o diretório de destino: ${REMOTE_DIR}...`);
      await client.ensureDir(REMOTE_DIR);
    } else {
      console.log(`📁 Enviando diretamente para a raiz da pasta FTP...`);
    }

    console.log(`📤 Enviando arquivos de dist/...`);
    const startTime = Date.now();

    // Upload de todos os arquivos de dist/ para o diretório remoto
    await client.uploadFromDir(distPath);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Deploy concluído com sucesso em ${elapsed}s!`);
    console.log(`🌐 Seu site na HostGator foi atualizado com a versão mais recente.`);
  } catch (err) {
    console.error('\n❌ Falha durante o deploy FTP:', err.message || err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
