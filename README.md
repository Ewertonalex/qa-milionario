# 🏆 QA Milionário

<div align="center">

![QA Milionário Logo](assets/icon-512.png)

**O quiz definitivo para profissionais de QA inspirado no Show do Milhão!**

[![Versão](https://img.shields.io/badge/versão-1.0.2-blue.svg)](https://github.com/Ewertonalex/qa-milionario/releases)
[![Plataforma](https://img.shields.io/badge/plataforma-Mac%20%7C%20Windows-green.svg)](#downloads)
[![Licença](https://img.shields.io/badge/licença-MIT-yellow.svg)](LICENSE)
[![ISTQB](https://img.shields.io/badge/ISTQB-CTFL-red.svg)](https://www.istqb.org/)

</div>

## 🎯 **Sobre o Projeto**

O **QA Milionário** é um jogo educativo inspirado no clássico **Show do Milhão** da TV brasileira, especialmente desenvolvido para profissionais de Quality Assurance (QA). 

### 📺 **Como o Show do Milhão**
- 🎪 **20 perguntas** progressivas com dificuldade crescente
- 💰 **Sistema de pontuação** (R$ 1.000 até R$ 1.000.000)
- 🆘 **Ajudas clássicas**: Universitários, Eliminar 2 alternativas, Pular pergunta
- ❤️ **Sistema de vidas** - 3 chances para continuar
- 🏆 **Ranking** para competir com outros jogadores

### 🔬 **Focado em QA**
- 📚 **Perguntas ISTQB CTFL** (Foundation Level)
- 🤖 **IA Gemini** gerando perguntas dinâmicas
- 🎯 **3 níveis de dificuldade**: Básico, Intermediário, Avançado
- 📖 **Conteúdo atualizado** com melhores práticas de QA

## 📥 **Downloads**

### 🍎 **macOS (Intel)**
[![Download para Mac](https://img.shields.io/badge/Download-macOS%20Intel-blue?style=for-the-badge&logo=apple)](https://github.com/Ewertonalex/qa-milionario/releases/download/v1.0.2/QA.Milionario-1.0.2.dmg)

**Tamanho:** 169MB | **Compatibilidade:** macOS 10.15+

### 🪟 **Windows**
[![Download para Windows](https://img.shields.io/badge/Download-Windows%20x64-blue?style=for-the-badge&logo=windows)](https://github.com/Ewertonalex/qa-milionario/releases/download/v1.0.2/QA.Milionario.Setup.1.0.2.exe)

**Tamanho:** 293MB | **Compatibilidade:** Windows 10+

---

## ✨ **Funcionalidades**

### 🎮 **Gameplay Completo**
- ✅ **20 perguntas ISTQB** profissionais
- ✅ **Sistema de pontuação** progressiva (R$ 1.000 a R$ 1.000.000)
- ✅ **3 níveis de dificuldade** (5 fáceis, 10 médias, 5 difíceis)
- ✅ **Sistema de vidas** (3 vidas por jogo)
- ✅ **Ranking local** persistente

### 🆘 **Sistema de Ajudas**
- 🎓 **Universitários** - Opinião de especialistas
- ✂️ **Eliminar 2** - Remove duas alternativas incorretas
- ⏭️ **Pular** - Pula a pergunta atual
- 🚪 **Desistir** - Sai do jogo mantendo pontuação

### 🤖 **Inteligência Artificial**
- 🧠 **IA Gemini** integrada para geração dinâmica de perguntas
- 📝 **Perguntas contextualizadas** sobre ISTQB CTFL
- 🔄 **Conteúdo sempre atualizado**

### 🎵 **Experiência Imersiva**
- 🔊 **8 efeitos sonoros** temáticos
- 🗣️ **Text-to-Speech** em português brasileiro
- ♿ **Acessibilidade completa**
- 📱 **Interface responsiva**

## 🚀 **Instalação**

### **macOS**
1. Baixe o arquivo `QA Milionário-1.0.2.dmg`
2. Duplo clique no arquivo baixado
3. Arraste o app para a pasta **Applications**
4. Execute o comando de segurança:
```bash
sudo xattr -rd com.apple.quarantine "/Applications/QA Milionário.app"
```

### **Windows**
1. Baixe o arquivo `QA Milionário Setup 1.0.2.exe`
2. Execute o instalador como administrador
3. Siga as instruções de instalação
4. Inicie o jogo pelo menu Iniciar

## 🎯 **Como Jogar**

### **1. Configuração Inicial**
- Digite seu nome na tela inicial
- Configure áudio e acessibilidade
- Escolha suas preferências de som

### **2. Gameplay**
- Responda 20 perguntas sobre ISTQB CTFL
- Use as ajudas estrategicamente
- Acumule pontos progressivamente
- Conquiste até R$ 1.000.000!

### **3. Sistema de Pontuação**
```
Pergunta  1-5  (Fácil):      R$ 1.000 - R$ 10.000
Pergunta  6-15 (Médio):      R$ 20.000 - R$ 500.000
Pergunta 16-20 (Difícil):    R$ 750.000 - R$ 1.000.000
```

## 🛠 **Tecnologias**

- **Framework:** React Native + Expo
- **Desktop:** Electron 25.9.8 LTS
- **IA:** Google Gemini API
- **Áudio:** Expo AV + Text-to-Speech
- **Armazenamento:** AsyncStorage
- **Build:** Electron Builder

## 📊 **Especificações Técnicas**

### **Requisitos Mínimos**
- **macOS:** 10.15 (Catalina) ou superior
- **Windows:** 10 (64-bit) ou superior
- **RAM:** 4GB mínimo, 8GB recomendado
- **Espaço:** 500MB livres
- **Internet:** Opcional (para IA Gemini)

### **Arquiteturas Suportadas**
- **macOS:** Intel x64 (Mac M1/M2 via Rosetta)
- **Windows:** x64, x86 (32-bit)

## 🤝 **Contribuição**

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Roadmap**

- [ ] **v1.1.0** - Suporte para Mac M1/M2 nativo
- [ ] **v1.2.0** - Modo multiplayer online
- [ ] **v1.3.0** - Banco de perguntas expandido
- [ ] **v1.4.0** - Certificações adicionais (ISTQB Advanced)
- [ ] **v1.5.0** - Versão mobile (iOS/Android)

## 🏆 **Conquistas**

- ✅ **Compatibilidade total** com Mac Intel
- ✅ **Interface profissional** e intuitiva
- ✅ **Performance otimizada** para desktop
- ✅ **Funcionalidades completas** do Show do Milhão
- ✅ **Conteúdo ISTQB** validado por especialistas

## 📞 **Suporte**

- 🐛 **Bugs:** [Issues](https://github.com/Ewertonalex/qa-milionario/issues)
- 💡 **Sugestões:** [Discussions](https://github.com/Ewertonalex/qa-milionario/discussions)
- 📧 **Contato:** ewerton@exemplo.com

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 **Autor**

**Ewerton Alexandre**
- GitHub: [@Ewertonalex](https://github.com/Ewertonalex)
- LinkedIn: [Ewerton Alexandre](https://linkedin.com/in/ewertonalex)

---

<div align="center">

**🎯 Teste seus conhecimentos de QA de forma divertida!**

[![Estrelas](https://img.shields.io/github/stars/Ewertonalex/qa-milionario?style=social)](https://github.com/Ewertonalex/qa-milionario/stargazers)
[![Forks](https://img.shields.io/github/forks/Ewertonalex/qa-milionario?style=social)](https://github.com/Ewertonalex/qa-milionario/network/members)

**Desenvolvido com ❤️ para a comunidade QA brasileira**

</div> 