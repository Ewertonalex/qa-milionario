# 🚀 Deploy QA Milionário no Netlify

Este guia mostra como fazer deploy do **QA Milionário** no Netlify.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Netlify
- Git configurado

## 🛠 Preparação do Build

### 1. Instalar Dependências
```bash
npm install
```

### 2. Gerar Build para Web
```bash
npm run build-netlify
```

Este comando irá:
- ✅ Gerar build web otimizado
- ✅ Adicionar meta tags SEO
- ✅ Criar manifest.json para PWA
- ✅ Copiar assets necessários
- ✅ Configurar redirects para SPA

## 🌐 Deploy no Netlify

### Opção 1: Deploy Manual
1. Acesse [netlify.com](https://netlify.com)
2. Faça login na sua conta
3. Clique em "Add new site" → "Deploy manually"
4. Arraste a pasta `dist-web` para a área de upload
5. Aguarde o deploy completar

### Opção 2: Deploy via Git (Recomendado)
1. Faça push do código para um repositório Git
2. No Netlify, clique em "Add new site" → "Import an existing project"
3. Conecte seu repositório
4. Configure as build settings:
   - **Build command:** `npm run build-netlify`
   - **Publish directory:** `dist-web`
   - **Node version:** `18`

### Opção 3: Deploy via Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist-web
```

## ⚙️ Configurações Importantes

### Variáveis de Ambiente
Se necessário, adicione no Netlify:
- `NODE_VERSION`: `18`
- Outras variáveis específicas do projeto

### Build Settings no Netlify
- **Repository:** Seu repositório Git
- **Branch to deploy:** `main` (ou sua branch principal)
- **Build command:** `npm run build-netlify`
- **Publish directory:** `dist-web`
- **Functions directory:** (deixar vazio)

## 🔧 Arquivos de Configuração

### netlify.toml
```toml
[build]
  publish = "dist-web"
  command = "npm run build-netlify"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### _redirects
```
/*    /index.html   200
```

## 🎯 Funcionalidades Incluídas

✅ **PWA Ready** - Manifest.json configurado
✅ **SEO Otimizado** - Meta tags completas
✅ **SPA Support** - Redirects configurados
✅ **Mobile Friendly** - Responsivo
✅ **Fast Loading** - Assets otimizados
✅ **Accessibility** - TTS e controles de áudio

## 🐛 Troubleshooting

### Build Falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build-netlify
```

### Página em Branco
- Verifique se o arquivo `index.html` está em `dist-web/`
- Verifique se o JavaScript está carregando
- Verifique console do navegador para erros

### Erro 404 em Rotas
- Verifique se `_redirects` está em `dist-web/`
- Verifique configuração de redirects no Netlify

## 🔗 URLs Úteis

- **Netlify Dashboard:** https://app.netlify.com/
- **Netlify Docs:** https://docs.netlify.com/
- **Build Logs:** Disponível no dashboard do site

## 🎉 Resultado

Após o deploy bem-sucedido, seu QA Milionário estará disponível em:
`https://[seu-site].netlify.app/`

### Recursos Disponíveis:
- 🎮 Jogo completo funcional
- 🤖 IA Gemini integrada (se API key configurada)
- 🔊 Sistema de áudio web
- 📱 Interface responsiva
- 🏆 Sistema de ranking local
- ♿ Acessibilidade completa

---

**Desenvolvido com ❤️ para a comunidade QA brasileira**
