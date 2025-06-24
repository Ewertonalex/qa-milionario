# 🎯 QA Milionário

**O jogo do Show do Milhão para profissionais de QA!**

Um aplicativo mobile educativo que testa conhecimentos em Quality Assurance através de perguntas geradas por IA, baseadas no syllabus ISTQB CTFL.

## 🌟 Características

### 🎮 Jogabilidade
- **20 perguntas** com dificuldade crescente
- **Sistema de pontuação**: 100 a 32.000 pontos
- **3 vidas** para erros
- **4 tipos de ajuda**: Universitários (IA), Eliminar 2, Pular, Desistir

### 🤖 IA Integrada
- **Google Gemini 1.5 Flash** para gerar perguntas dinâmicas
- **Conteúdo baseado no ISTQB CTFL**
- **Ajuda dos Universitários** com explicações da IA

### ♿ Acessibilidade
- **Text-to-Speech (TTS)** para leitura de perguntas
- **Interface otimizada** para diferentes necessidades
- **Controles de áudio** configuráveis

### 🎵 Experiência Sonora
- **Sons dinâmicos** para cada ação do jogo
- **Feedback auditivo** para respostas corretas/incorretas
- **Controle total** do áudio pelo usuário

## 🚀 Como Executar

### Pré-requisitos
```bash
node >= 16
npm ou yarn
Expo CLI
```

### Instalação
```bash
# Clone o repositório
git clone [seu-repositorio]
cd qa-milionario

# Instale as dependências
npm install

# Inicie o projeto
npm start
```

### Executar no Dispositivo
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📱 Telas do App

1. **Login**: Entrada com nome do jogador
2. **Home**: Dashboard com opções e configurações
3. **Game**: Tela principal do jogo
4. **Result**: Resultados finais e estatísticas

## 🛠 Tecnologias

- **React Native** (Expo)
- **TypeScript**
- **Google Gemini 1.5 Flash Latest**
- **React Native TTS**
- **React Native Animatable**
- **AsyncStorage**

## 🎯 Conteúdo Educativo

Todas as perguntas são baseadas no **ISTQB CTFL (Certified Tester Foundation Level)**, cobrindo:

- Fundamentos de Teste
- Teste ao Longo do SDLC
- Teste Estático
- Técnicas de Teste
- Gerenciamento de Teste
- Ferramentas de Teste

## 🔧 Configuração da API

### Google Gemini
1. Obtenha uma API Key no [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Substitua a chave no arquivo `App.tsx`:
```typescript
const GEMINI_API_KEY = 'sua-api-key-aqui';
```

## 📊 Status do Projeto

- ✅ **Jogabilidade completa** implementada
- ✅ **IA Gemini** integrada
- ✅ **Sistema de ajudas** funcional
- ✅ **Acessibilidade** com TTS
- ✅ **Interface responsiva**
- ✅ **Persistência de dados**

## 🎮 Como Jogar

1. **Digite seu nome** na tela de login
2. **Configure áudio/acessibilidade** se necessário
3. **Clique em "Iniciar Jogo"**
4. **Responda as perguntas** ou use as ajudas disponíveis
5. **Tente chegar aos 32.000 pontos!**

## 📝 Licença

Este projeto é educativo e open source.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

---

**Desenvolvido com ❤️ para a comunidade de QA** 