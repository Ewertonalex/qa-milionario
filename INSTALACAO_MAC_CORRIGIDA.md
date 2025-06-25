# 🍎 QA Milionário - Instalação Mac Corrigida

## 📦 **Versão Corrigida Disponível**

### ✅ **Correções Implementadas:**
- **Electron 27.3.11** (versão mais estável para Mac Intel)
- **Desabilitação de GPU sandbox** para evitar crashes
- **Configurações de segurança ajustadas** para macOS 15.5
- **Entry points corrigidos** para evitar conflitos
- **Hardened Runtime desabilitado** para compatibilidade

### 📍 **Arquivos Disponíveis:**
- **`QA Milionário-1.0.1.dmg`** (174MB) - **RECOMENDADO**
- **`QA Milionário-1.0.1-mac.zip`** (176MB) - Versão ZIP

### 🚀 **Como Instalar:**

#### **Opção 1: DMG (Recomendado)**
1. Baixe: `dist/QA Milionário-1.0.1.dmg`
2. Duplo clique no arquivo `.dmg`
3. Arraste o **QA Milionário** para a pasta **Applications**
4. Ejecte o DMG
5. Abra o app pela pasta Applications

#### **Opção 2: ZIP**
1. Baixe: `dist/QA Milionário-1.0.1-mac.zip`
2. Extraia o arquivo ZIP
3. Mova o **QA Milionário.app** para a pasta **Applications**
4. Abra o app pela pasta Applications

### 🔐 **Primeira Execução:**

Como o app não é assinado pela Apple, você pode ver uma mensagem de segurança:

1. **Se aparecer "não pode ser aberto":**
   - Vá em **System Preferences** → **Security & Privacy**
   - Clique em **"Open Anyway"** na parte inferior
   
2. **Alternativa via Terminal:**
   ```bash
   sudo xattr -rd com.apple.quarantine "/Applications/QA Milionário.app"
   ```

### 🎮 **Funcionalidades:**
- ✅ **20 Perguntas ISTQB** completas
- ✅ **IA Gemini** para gerar perguntas dinâmicas
- ✅ **Text-to-Speech** em português
- ✅ **8 Efeitos sonoros** profissionais
- ✅ **Sistema de ajudas** (Universitários, Eliminar 2, Pular)
- ✅ **Ranking local** com pontuações
- ✅ **Interface responsiva** e acessível

### 🛠 **Especificações Técnicas:**
- **Electron:** 27.3.11
- **Plataforma:** macOS Intel (x64)
- **Tamanho:** ~174MB
- **Compatibilidade:** macOS 10.15+

### 🆘 **Resolução de Problemas:**

#### **App não abre:**
```bash
# Remover quarentena
sudo xattr -rd com.apple.quarantine "/Applications/QA Milionário.app"

# Verificar permissões
ls -la "/Applications/QA Milionário.app"
```

#### **Crash ao iniciar:**
- Certifique-se que está usando a versão **1.0.1**
- Reinicie o Mac
- Tente abrir via Terminal para ver logs:
```bash
open "/Applications/QA Milionário.app"
```

### 📊 **Comparação de Versões:**

| Versão | Electron | Status | Compatibilidade |
|--------|----------|--------|------------------|
| 1.0.0  | 28.3.3   | ❌ Crash | Incompatível |
| 1.0.1  | 27.3.11  | ✅ Funciona | Mac Intel |

### 🎯 **Próximos Passos:**
1. Instale a versão **1.0.1**
2. Teste todas as funcionalidades
3. Reporte qualquer problema
4. Aproveite o jogo! 🏆

---

**Desenvolvido por:** Ewerton Alexandre  
**GitHub:** @Ewertonalex  
**Versão:** 1.0.1 (Corrigida)  
**Data:** 24/06/2025 