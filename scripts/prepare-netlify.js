const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando build para Netlify...');

const distPath = path.join(__dirname, '..', 'dist-web');
const indexPath = path.join(distPath, 'index.html');

// Verificar se o arquivo index.html existe
if (fs.existsSync(indexPath)) {
  console.log('✅ Build web encontrado!');
  
  // Ler o conteúdo do index.html
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Adicionar meta tags para SEO e PWA
  const metaTags = `
    <meta name="description" content="QA Milionário - O quiz definitivo para profissionais de QA inspirado no Show do Milhão!" />
    <meta name="keywords" content="QA, Quality Assurance, ISTQB, Quiz, Teste de Software, Show do Milhão" />
    <meta name="author" content="Ewerton Alexandre" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://qa-milionario.netlify.app/" />
    <meta property="og:title" content="QA Milionário - Quiz de QA" />
    <meta property="og:description" content="O quiz definitivo para profissionais de QA inspirado no Show do Milhão!" />
    <meta property="og:image" content="/assets/icon-512.png" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://qa-milionario.netlify.app/" />
    <meta property="twitter:title" content="QA Milionário - Quiz de QA" />
    <meta property="twitter:description" content="O quiz definitivo para profissionais de QA inspirado no Show do Milhão!" />
    <meta property="twitter:image" content="/assets/icon-512.png" />
    
    <!-- PWA -->
    <meta name="theme-color" content="#1a237e" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="QA Milionário" />
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Icons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon.png" />`;
  
  // Inserir meta tags antes do </head>
  indexContent = indexContent.replace('</head>', metaTags + '\n  </head>');
  
  // Salvar o arquivo modificado
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Meta tags adicionadas ao index.html');
  
  // Criar manifest.json para PWA
  const manifest = {
    "name": "QA Milionário - Quiz de QA",
    "short_name": "QA Milionário",
    "description": "O quiz definitivo para profissionais de QA inspirado no Show do Milhão!",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a237e",
    "theme_color": "#1a237e",
    "orientation": "portrait",
    "lang": "pt-BR",
    "icons": [
      {
        "src": "/assets/icon.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/assets/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable any"
      }
    ]
  };
  
  const manifestPath = path.join(distPath, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest.json criado para PWA');
  
  // Copiar assets se necessário
  const assetsSource = path.join(__dirname, '..', 'assets');
  const assetsTarget = path.join(distPath, 'assets');
  
  if (!fs.existsSync(assetsTarget)) {
    fs.mkdirSync(assetsTarget, { recursive: true });
  }
  
  // Copiar ícones principais
  const iconFiles = ['icon.png', 'icon-512.png', 'favicon.png'];
  iconFiles.forEach(file => {
    const sourcePath = path.join(assetsSource, file);
    const targetPath = path.join(assetsTarget, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${file} copiado para assets`);
    }
  });
  
  // Criar arquivo _redirects para SPA
  const redirectsContent = '/*    /index.html   200';
  fs.writeFileSync(path.join(distPath, '_redirects'), redirectsContent);
  console.log('✅ Arquivo _redirects criado para SPA');
  
  console.log('🎉 Build preparado para Netlify com sucesso!');
  console.log('📁 Arquivos prontos em: dist-web/');
  
} else {
  console.error('❌ Arquivo index.html não encontrado em dist-web/');
  console.log('Execute primeiro: npm run build-web');
  process.exit(1);
}
