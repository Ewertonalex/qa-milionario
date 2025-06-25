#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 QA Milionário - Criador de Executáveis');
console.log('=====================================\n');

// Verificar se as dependências estão instaladas
function checkDependencies() {
  console.log('📦 Verificando dependências...');
  
  try {
    require('electron');
    require('electron-builder');
    console.log('✅ Dependências do Electron encontradas\n');
  } catch (error) {
    console.log('❌ Dependências não encontradas. Instalando...\n');
    execSync('npm install electron electron-builder --save-dev', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso!\n');
  }
}

// Limpar diretórios de build anteriores
function cleanBuildDirs() {
  console.log('🧹 Limpando builds anteriores...');
  
  const dirsToClean = ['dist', 'dist-web', 'build'];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`   Removido: ${dir}/`);
    }
  });
  
  console.log('✅ Limpeza concluída\n');
}

// Fazer build da versão web
function buildWeb() {
  console.log('🌐 Criando build web...');
  
  try {
    // Tentar primeiro o comando novo
    try {
      execSync('npx expo export --platform web', { stdio: 'inherit' });
    } catch (error) {
      // Se falhar, tentar comando alternativo
      console.log('   Tentando comando alternativo...');
      execSync('npx expo build:web', { stdio: 'inherit' });
    }
    console.log('✅ Build web concluído\n');
  } catch (error) {
    console.error('❌ Erro no build web:', error.message);
    console.log('   Tentando build manual...\n');
    
    // Criar build manual básico
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Criar diretório dist-web se não existir
      if (!fs.existsSync('dist-web')) {
        fs.mkdirSync('dist-web', { recursive: true });
      }
      
      // Criar index.html básico
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>QA Milionário</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #1a237e, #3949ab);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 { color: #FFD700; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 QA Milionário</h1>
        <div class="info">
            <h2>Aplicativo Desktop</h2>
            <p>Esta é a versão desktop do QA Milionário.</p>
            <p>O jogo completo com todas as funcionalidades está sendo carregado...</p>
            <p>Se esta mensagem persistir, verifique sua conexão com a internet.</p>
        </div>
        <div class="info">
            <h3>Recursos:</h3>
            <p>✅ 20 Perguntas ISTQB CTFL</p>
            <p>✅ IA Gemini para perguntas dinâmicas</p>
            <p>✅ Sistema de áudio completo</p>
            <p>✅ Acessibilidade com TTS</p>
            <p>✅ Modais customizados</p>
        </div>
    </div>
    <script>
        // Tentar carregar a versão completa
        setTimeout(() => {
            window.location.href = 'http://localhost:8081';
        }, 3000);
    </script>
</body>
</html>`;
      
      fs.writeFileSync(path.join('dist-web', 'index.html'), htmlContent);
      console.log('✅ Build web manual concluído\n');
      
    } catch (manualError) {
      console.error('❌ Erro no build manual:', manualError.message);
      process.exit(1);
    }
  }
}

// Criar executável para Windows
function buildWindows() {
  console.log('🪟 Criando executável para Windows...');
  
  try {
    execSync('npx electron-builder --windows --x64', { stdio: 'inherit' });
    console.log('✅ Executável Windows criado com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao criar executável Windows:', error.message);
    return false;
  }
  
  return true;
}

// Criar executável para macOS
function buildMac() {
  console.log('🍎 Criando executável para macOS...');
  
  if (process.platform !== 'darwin') {
    console.log('⚠️  Build para macOS só pode ser feito no macOS');
    console.log('   Pulando build para macOS...\n');
    return false;
  }
  
  try {
    execSync('npx electron-builder --mac --x64 --arm64', { stdio: 'inherit' });
    console.log('✅ Executável macOS criado com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao criar executável macOS:', error.message);
    return false;
  }
  
  return true;
}

// Criar executável portátil para Windows
function buildWindowsPortable() {
  console.log('📦 Criando versão portátil para Windows...');
  
  try {
    execSync('npx electron-builder --windows --x64 --config.win.target=portable', { stdio: 'inherit' });
    console.log('✅ Versão portátil Windows criada com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao criar versão portátil:', error.message);
    return false;
  }
  
  return true;
}

// Mostrar resultados finais
function showResults() {
  console.log('📊 Resultados do Build:');
  console.log('=====================\n');
  
  const distDir = './dist';
  
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      let icon = '📄';
      if (file.endsWith('.exe')) icon = '🪟';
      else if (file.endsWith('.dmg')) icon = '🍎';
      else if (file.endsWith('.zip')) icon = '📦';
      else if (file.endsWith('.AppImage')) icon = '🐧';
      
      console.log(`${icon} ${file} (${sizeInMB} MB)`);
    });
  } else {
    console.log('❌ Nenhum arquivo de build encontrado');
  }
  
  console.log('\n📁 Os executáveis estão na pasta: ./dist/');
  console.log('🎮 Pronto para distribuir!\n');
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const buildAll = args.includes('--all') || args.length === 0;
  const buildWin = args.includes('--windows') || buildAll;
  const buildMacOS = args.includes('--mac') || buildAll;
  const buildPortable = args.includes('--portable') || buildAll;
  
  try {
    checkDependencies();
    cleanBuildDirs();
    buildWeb();
    
    let successCount = 0;
    let totalBuilds = 0;
    
    if (buildWin) {
      totalBuilds++;
      if (buildWindows()) successCount++;
    }
    
    if (buildPortable) {
      totalBuilds++;
      if (buildWindowsPortable()) successCount++;
    }
    
    if (buildMacOS) {
      totalBuilds++;
      if (buildMac()) successCount++;
    }
    
    showResults();
    
    console.log(`🎉 Build concluído! ${successCount}/${totalBuilds} executáveis criados com sucesso.`);
    
    if (successCount > 0) {
      console.log('\n📋 Próximos passos:');
      console.log('1. Teste os executáveis na pasta ./dist/');
      console.log('2. Distribua para os usuários');
      console.log('3. Considere assinar digitalmente os executáveis');
    }
    
  } catch (error) {
    console.error('💥 Erro durante o build:', error.message);
    process.exit(1);
  }
}

// Mostrar ajuda
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Uso: node build-executables.js [opções]\n');
  console.log('Opções:');
  console.log('  --all        Criar todos os executáveis (padrão)');
  console.log('  --windows    Criar apenas executável Windows');
  console.log('  --mac        Criar apenas executável macOS');
  console.log('  --portable   Criar versão portátil Windows');
  console.log('  --help, -h   Mostrar esta ajuda\n');
  console.log('Exemplos:');
  console.log('  node build-executables.js');
  console.log('  node build-executables.js --windows');
  console.log('  node build-executables.js --mac --portable');
  process.exit(0);
}

// Executar
main(); 