# 🚀 Guia Completo: Publicar QA Milionário na Google Play Store

## 📋 Pré-requisitos

### 1. **Conta Google Play Console**
- Acesse [play.google.com/console](https://play.google.com/console)
- Crie uma conta de desenvolvedor (taxa única de $25 USD)
- Complete o processo de verificação

### 2. **Conta Expo/EAS**
- Acesse [expo.dev/signup](https://expo.dev/signup)
- Crie conta com: **milionarioqa@gmail.com** / **enzoalex17**
- Confirme o email

## 🛠️ Etapa 1: Configuração do Build

### 1.1 Login no EAS
```bash
eas login
# Use: milionarioqa@gmail.com / enzoalex17
```

### 1.2 Configurar Projeto
```bash
eas build:configure
```

### 1.3 Gerar Keystore (Primeira vez)
```bash
eas credentials
```
- Escolha **Android**
- Escolha **production**
- Escolha **Generate new keystore**

## 🏗️ Etapa 2: Build para Produção

### 2.1 Build AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```

### 2.2 Download do AAB
- Acesse o link fornecido pelo EAS
- Baixe o arquivo `.aab`

## 📱 Etapa 3: Google Play Console

### 3.1 Criar Novo App
1. Acesse [Google Play Console](https://play.google.com/console)
2. Clique em **"Criar app"**
3. Preencha:
   - **Nome do app**: QA Milionário
   - **Idioma padrão**: Português (Brasil)
   - **Tipo de app**: App
   - **Categoria**: Educação
   - **Gratuito/Pago**: Gratuito

### 3.2 Configurar Informações do App

#### **Detalhes do App**
- **Título**: QA Milionário
- **Descrição curta**: Jogo educativo estilo Show do Milhão para profissionais de QA
- **Descrição completa**:
```
🏆 QA Milionário - O jogo definitivo para profissionais de Testing!

Inspirado no clássico "Show do Milhão", o QA Milionário é um jogo educativo especialmente desenvolvido para profissionais de Quality Assurance e Testing de Software.

🎯 CARACTERÍSTICAS:
• 20 perguntas baseadas no ISTQB CTFL
• Perguntas geradas por Inteligência Artificial (Google Gemini)
• 3 níveis de dificuldade progressiva
• Sistema de vidas e pontuação
• Ajudas clássicas: Universitários, Eliminar 2, Pular
• 100% acessível com Text-to-Speech em português
• Sons originais do Show do Milhão

🎮 COMO JOGAR:
• Responda perguntas sobre Testing e QA
• Use estrategicamente as 4 ajudas disponíveis
• Acumule pontos e compete no ranking
• Complete todas as 20 perguntas para ser um verdadeiro milionário do QA!

♿ ACESSIBILIDADE:
• Leitura automática de perguntas e opções
• Interface adaptada para deficientes visuais
• Controles de áudio intuitivos

🎓 EDUCATIVO:
Baseado no syllabus oficial ISTQB CTFL v4.0, ideal para:
• Profissionais de QA iniciantes
• Estudantes de Testing
• Preparação para certificação ISTQB
• Revisão de conceitos fundamentais

Desenvolvido por profissionais de QA para a comunidade de Testing!
```

#### **Gráficos e Imagens**
Você precisará criar:
- **Ícone do app**: 512x512px (já temos: assets/icon.png)
- **Imagem de destaque**: 1024x500px
- **Screenshots**: 
  - Telefone: 16:9 ou 9:16 (mín. 320px)
  - Tablet: pelo menos 1 screenshot

### 3.3 Classificação de Conteúdo
1. Acesse **"Classificação de conteúdo"**
2. Preencha o questionário:
   - **Categoria**: Educação
   - **Conteúdo educacional**: Sim
   - **Violência**: Não
   - **Conteúdo sexual**: Não
   - **Linguagem imprópria**: Não

### 3.4 Público-alvo
- **Idade mínima**: 13 anos
- **Público principal**: Adultos (18+)
- **Interesse especial em crianças**: Não

## 📦 Etapa 4: Upload do App

### 4.1 Teste Interno
1. Acesse **"Teste interno"**
2. Clique em **"Criar nova versão"**
3. Upload do arquivo `.aab`
4. Preencha **"Notas da versão"**:
```
Versão inicial do QA Milionário:
• 20 perguntas ISTQB CTFL geradas por IA
• Sistema completo de acessibilidade
• Sons originais do Show do Milhão
• 3 níveis de dificuldade
• Sistema de ranking e pontuação
```

### 4.2 Configurar Testadores
- Adicione emails de testadores
- Ou crie lista de testadores por email

## 🔍 Etapa 5: Revisão e Publicação

### 5.1 Política de Privacidade
Crie uma página web com a política de privacidade:
```
POLÍTICA DE PRIVACIDADE - QA MILIONÁRIO

1. COLETA DE DADOS
O QA Milionário não coleta dados pessoais dos usuários.

2. ARMAZENAMENTO LOCAL
• Pontuações e recordes são salvos localmente no dispositivo
• Nenhum dado é enviado para servidores externos

3. PERMISSÕES
• INTERNET: Para gerar perguntas via API Gemini
• ACCESS_NETWORK_STATE: Para verificar conectividade

4. ACESSIBILIDADE
• Text-to-Speech usa recursos nativos do sistema
• Nenhum áudio é gravado ou armazenado

5. CONTATO
Para dúvidas: milionarioqa@gmail.com

Última atualização: [DATA]
```

### 5.2 Revisão Final
1. Complete todas as seções obrigatórias
2. Verifique se não há erros ou avisos
3. Clique em **"Enviar para revisão"**

## ⏱️ Etapa 6: Aguardar Aprovação

- **Tempo de revisão**: 1-3 dias úteis
- **Notificação**: Por email
- **Status**: Acompanhe no Play Console

## 🎉 Etapa 7: Publicação

Após aprovação:
1. Vá para **"Produção"**
2. Clique em **"Promover versão"**
3. Selecione a versão do teste interno
4. Configure o lançamento:
   - **Percentual**: 100% (lançamento completo)
   - **Países**: Brasil (ou todos)

## 📊 Pós-Publicação

### Monitoramento
- **Play Console**: Estatísticas, reviews, crashes
- **Analytics**: Downloads, retenção, receita
- **Feedback**: Responder reviews dos usuários

### Atualizações
Para futuras versões:
1. Incremente `versionCode` no `app.json`
2. Atualize `version` se necessário
3. Repita o processo de build
4. Upload da nova versão

## 🆘 Solução de Problemas

### Build Falha
```bash
# Limpar cache
expo r -c

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Tentar build novamente
eas build --platform android --profile production
```

### Erro de Keystore
```bash
# Regenerar credenciais
eas credentials
```

### Rejeição na Play Store
- Verifique política de conteúdo
- Corrija problemas apontados
- Reenvie para revisão

## 📞 Suporte

- **EAS Build**: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction)
- **Play Console**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- **ISTQB**: [istqb.org](https://istqb.org)

---

🎯 **Boa sorte com a publicação do QA Milionário!** 🏆 