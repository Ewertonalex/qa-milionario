# 🚀 Guia de Executáveis - QA Milionário

Este guia explica como criar executáveis do QA Milionário para **Windows** e **macOS**.

---

## 📋 **Pré-requisitos**

### **Todos os Sistemas:**
- ✅ Node.js 18+ instalado
- ✅ npm ou yarn
- ✅ Projeto QA Milionário clonado

### **Para Windows (.exe):**
- ✅ Pode ser criado em qualquer sistema (Windows, macOS, Linux)
- ✅ Electron Builder fará cross-compilation

### **Para macOS (.app/.dmg):**
- ⚠️ **DEVE ser criado apenas no macOS** (limitação da Apple)
- ✅ Xcode Command Line Tools instalado

---

## 🛠️ **Instalação das Dependências**

```bash
# 1. Instalar dependências do Electron
npm install electron electron-builder --save-dev

# 2. Verificar se tudo está instalado
npm list electron electron-builder
```

---

## 🚀 **Método 1: Script Automatizado (Recomendado)**

### **Criar Todos os Executáveis:**
```bash
node build-executables.js
```

### **Criar Apenas Windows:**
```bash
node build-executables.js --windows
```

### **Criar Apenas macOS:**
```bash
node build-executables.js --mac
```

### **Criar Versão Portátil (Windows):**
```bash
node build-executables.js --portable
```

### **Ver Ajuda:**
```bash
node build-executables.js --help
```

---

## ⚙️ **Método 2: Comandos Manuais**

### **1. Preparar Build Web:**
```bash
npm run build-web
```

### **2. Criar Executável Windows:**
```bash
npm run build-windows
```

### **3. Criar Executável macOS:**
```bash
npm run build-mac
```

### **4. Criar Todos:**
```bash
npm run build-all
```

---

## 📁 **Estrutura dos Arquivos Gerados**

Após o build, os executáveis estarão em `./dist/`:

```
dist/
├── 🪟 QA Milionário Setup 1.0.0.exe     # Instalador Windows
├── 🪟 QA Milionário 1.0.0.exe           # Versão portátil Windows
├── 🍎 QA Milionário-1.0.0.dmg           # Instalador macOS
├── 🍎 QA Milionário-1.0.0-mac.zip       # App macOS compactado
└── 📊 builder-debug.yml                  # Log de debug
```

---

## 💻 **Tipos de Executáveis**

### **🪟 Windows:**

#### **Setup (Instalador):**
- **Arquivo**: `QA Milionário Setup 1.0.0.exe`
- **Tamanho**: ~120-150 MB
- **Funcionalidade**: Instala o app no sistema
- **Localização**: `C:\Users\[Usuario]\AppData\Local\QA Milionário\`
- **Atalhos**: Desktop + Menu Iniciar
- **Desinstalação**: Via Painel de Controle

#### **Portable (Portátil):**
- **Arquivo**: `QA Milionário 1.0.0.exe`
- **Tamanho**: ~120-150 MB
- **Funcionalidade**: Executa direto, sem instalação
- **Vantagem**: Pode ser executado de pen drive
- **Desvantagem**: Não cria atalhos automáticos

### **🍎 macOS:**

#### **DMG (Instalador):**
- **Arquivo**: `QA Milionário-1.0.0.dmg`
- **Tamanho**: ~130-160 MB
- **Funcionalidade**: Arraste para Applications
- **Localização**: `/Applications/QA Milionário.app`
- **Launchpad**: Aparece automaticamente

#### **ZIP (Compactado):**
- **Arquivo**: `QA Milionário-1.0.0-mac.zip`
- **Tamanho**: ~100-130 MB
- **Funcionalidade**: Descompacte e execute
- **Uso**: Para distribuição alternativa

---

## 🎯 **Como Usar os Executáveis**

### **🪟 Windows:**

#### **Instalador (.exe):**
1. **Baixe** `QA Milionário Setup 1.0.0.exe`
2. **Execute** como Administrador (clique direito → "Executar como administrador")
3. **Siga** o assistente de instalação
4. **Escolha** diretório de instalação (opcional)
5. **Aguarde** a instalação (1-2 minutos)
6. **Execute** via atalho no Desktop ou Menu Iniciar

#### **Portátil (.exe):**
1. **Baixe** `QA Milionário 1.0.0.exe`
2. **Coloque** em qualquer pasta (ou pen drive)
3. **Execute** diretamente (duplo clique)
4. **Aguarde** inicialização (30-60 segundos)

### **🍎 macOS:**

#### **DMG (Recomendado):**
1. **Baixe** `QA Milionário-1.0.0.dmg`
2. **Abra** o arquivo DMG (duplo clique)
3. **Arraste** o ícone do app para a pasta "Applications"
4. **Execute** via Launchpad ou Applications
5. **Primeira execução**: Sistema pedirá permissão (clique "Abrir")

#### **ZIP (Alternativo):**
1. **Baixe** `QA Milionário-1.0.0-mac.zip`
2. **Descompacte** (duplo clique)
3. **Mova** `QA Milionário.app` para Applications (opcional)
4. **Execute** diretamente

---

## 🛡️ **Problemas de Segurança e Soluções**

### **🪟 Windows:**

#### **Windows Defender:**
```
⚠️ "Windows protegeu seu PC"
```
**Solução:**
1. Clique em "Mais informações"
2. Clique em "Executar assim mesmo"
3. **Motivo**: App não assinado digitalmente

#### **SmartScreen:**
```
⚠️ "Aplicativo não reconhecido"
```
**Solução:**
1. Clique em "Mais informações"
2. Clique em "Executar assim mesmo"

### **🍎 macOS:**

#### **Gatekeeper:**
```
⚠️ "QA Milionário não pode ser aberto porque é de um desenvolvedor não identificado"
```
**Solução:**
1. **Método 1**: Clique direito → "Abrir" → "Abrir"
2. **Método 2**: Sistema → Segurança → "Abrir assim mesmo"
3. **Método 3**: Terminal: `sudo xattr -cr "/Applications/QA Milionário.app"`

#### **Notarização:**
```
⚠️ "QA Milionário não foi verificado para malware"
```
**Solução**: Mesmo processo do Gatekeeper

---

## 🔧 **Troubleshooting**

### **❌ Build Falha:**

#### **Erro: "electron não encontrado"**
```bash
npm install electron --save-dev
```

#### **Erro: "expo export:web falha"**
```bash
npx expo install --fix
npm start
```

#### **Erro: "Cannot resolve module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **❌ Executável Não Abre:**

#### **Windows:**
- **Verifique** se tem Visual C++ Redistributable
- **Execute** como Administrador
- **Desative** temporariamente antivírus

#### **macOS:**
- **Verifique** permissões de segurança
- **Execute** via Terminal para ver erros:
  ```bash
  /Applications/QA\ Milionário.app/Contents/MacOS/QA\ Milionário
  ```

### **❌ App Fica em Branco:**

#### **Soluções:**
1. **Aguarde** 1-2 minutos (primeira inicialização)
2. **Pressione** Ctrl+R (recarregar)
3. **Feche** e abra novamente
4. **Verifique** conexão com internet (para IA)

---

## 📊 **Especificações Técnicas**

### **💾 Tamanhos dos Arquivos:**
- **Windows Setup**: ~140 MB
- **Windows Portable**: ~135 MB
- **macOS DMG**: ~150 MB
- **macOS ZIP**: ~120 MB

### **🖥️ Requisitos de Sistema:**

#### **Windows:**
- **SO**: Windows 7 SP1+ (64-bit)
- **RAM**: 2 GB mínimo, 4 GB recomendado
- **Espaço**: 200 MB livres
- **Processador**: Intel/AMD x64

#### **macOS:**
- **SO**: macOS 10.11+ (El Capitan)
- **RAM**: 2 GB mínimo, 4 GB recomendado
- **Espaço**: 200 MB livres
- **Processador**: Intel x64 ou Apple Silicon (M1/M2)

---

## 🎨 **Personalização**

### **Alterar Ícone:**
1. **Substitua** `assets/icon.png` (512x512px)
2. **Refaça** o build
3. **Formatos suportados**: PNG, ICO (Windows), ICNS (macOS)

### **Alterar Nome:**
1. **Edite** `package.json`:
   ```json
   {
     "name": "meu-qa-app",
     "build": {
       "productName": "Meu QA App"
     }
   }
   ```
2. **Refaça** o build

### **Alterar Versão:**
1. **Edite** `package.json`:
   ```json
   {
     "version": "2.0.0"
   }
   ```
2. **Refaça** o build

---

## 📤 **Distribuição**

### **🌐 Upload para GitHub:**
```bash
# Criar release
git tag v1.0.0
git push origin v1.0.0

# Upload manual via GitHub Releases
# Anexe os arquivos da pasta ./dist/
```

### **☁️ Outras Opções:**
- **Google Drive**: Compartilhamento direto
- **Dropbox**: Links públicos
- **WeTransfer**: Envio temporário
- **Servidor próprio**: FTP/HTTP

### **📋 Checklist de Distribuição:**
- ✅ Testar executável antes de distribuir
- ✅ Incluir instruções de instalação
- ✅ Avisar sobre alertas de segurança
- ✅ Fornecer checksums MD5/SHA256 (opcional)
- ✅ Documentar requisitos de sistema

---

## 🔐 **Assinatura Digital (Opcional)**

### **🪟 Windows:**
- **Certificado**: Code Signing Certificate (~$200/ano)
- **Ferramenta**: SignTool (Windows SDK)
- **Benefício**: Remove alertas do SmartScreen

### **🍎 macOS:**
- **Certificado**: Apple Developer Account ($99/ano)
- **Processo**: Notarização via Xcode
- **Benefício**: Remove alertas do Gatekeeper

---

## 📞 **Suporte**

### **🐛 Reportar Problemas:**
- **GitHub Issues**: https://github.com/Ewertonalex/qa-milionario/issues
- **Inclua**: SO, versão, erro completo, steps to reproduce

### **💡 Sugestões:**
- **Melhorias** de build process
- **Novos formatos** de distribuição
- **Automação** de releases

---

## 🎉 **Sucesso!**

Se chegou até aqui, você agora tem:

- ✅ **Executável Windows** (.exe)
- ✅ **Executável macOS** (.app/.dmg)
- ✅ **Conhecimento** para distribuir
- ✅ **Soluções** para problemas comuns

**🎮 Agora é só distribuir o QA Milionário para o mundo!**

---

*Criado com ❤️ por [Ewerton Alexandre](https://github.com/Ewertonalex)* 