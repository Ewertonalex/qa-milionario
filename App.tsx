import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importação condicional do TTS apenas em plataformas nativas
let Tts: any = null;
if (Platform.OS !== 'web') {
  try {
    Tts = require('react-native-tts');
  } catch (e) {
    console.log('TTS não disponível nesta plataforma');
  }
}

const { width, height } = Dimensions.get('window');

// Configuração da API Gemini com múltiplas chaves para rotação
const GEMINI_API_KEYS = [
  'AIzaSyCCc8BY7EYXxY9MTAC_ZikFwdbjiw6Q8ZE', // Chave principal
  
  // 🔑 ADICIONE SUAS OUTRAS CHAVES AQUI:
  // Descomente e adicione suas chaves backup:
  // 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Chave backup 1
  // 'AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // Chave backup 2  
  // 'AIzaSyZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // Chave backup 3
  // 'AIzaSyWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // Chave backup 4
  
  // Quanto mais chaves, mais confiável será o sistema!
];

const getGeminiApiUrl = (keyIndex: number = 0) => {
  const apiKey = GEMINI_API_KEYS[keyIndex] || GEMINI_API_KEYS[0];
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
};

// Função para tentar múltiplas API keys
const tryMultipleApiKeys = async (requestBody: any, operation: string = 'API call'): Promise<any> => {
  let lastError = null;
  
  for (let keyIndex = 0; keyIndex < GEMINI_API_KEYS.length; keyIndex++) {
    const apiUrl = getGeminiApiUrl(keyIndex);
    const keyName = keyIndex === 0 ? 'principal' : `backup ${keyIndex}`;
    
    console.log(`🔑 Tentando ${operation} com chave ${keyName} (${keyIndex + 1}/${GEMINI_API_KEYS.length})`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📡 Status da resposta (chave ${keyName}):`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro da API (chave ${keyName}):`, errorText);
        
        if (response.status === 429) {
          console.warn(`⚠️ Limite atingido na chave ${keyName}, tentando próxima...`);
          lastError = new Error('RATE_LIMIT_EXCEEDED');
          continue; // Tenta próxima chave
        } else {
          throw new Error(`API_ERROR_${response.status}`);
        }
      }

      // Sucesso! Retorna os dados
      const data = await response.json();
      console.log(`✅ Sucesso com chave ${keyName}!`);
      return data;
      
    } catch (error) {
      console.error(`❌ Erro com chave ${keyName}:`, error.message);
      lastError = error;
      
      // Se não for erro 429, não tenta outras chaves
      if (error.message !== 'RATE_LIMIT_EXCEEDED') {
        throw error;
      }
    }
  }
  
  // Se chegou aqui, todas as chaves falharam
  console.error('❌ Todas as API keys falharam');
  throw lastError || new Error('ALL_KEYS_FAILED');
};

// Tipos
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface GameState {
  currentQuestion: number;
  score: number;
  lives: number;
  questions: Question[];
  usedHelps: {
    universities: boolean;
    eliminate: boolean;
    skip: boolean;
  };
  gameStarted: boolean;
  gameFinished: boolean;
}

// Serviço de Áudio
class AudioService {
  private static instance: AudioService;
  private audioEnabled: boolean = true;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  setEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
  }

  isEnabled(): boolean {
    return this.audioEnabled;
  }

  // Efeitos sonoros estilo Show do Milhão
  private playTone(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') {
    if (!this.audioEnabled || Platform.OS !== 'web') {
      console.log(`🎵 Som: ${frequency}Hz por ${duration}ms`);
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        // @ts-ignore
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      }
    } catch (e) {
      console.log('Erro ao reproduzir som:', e);
    }
  }

  playIntro() {
    if (!this.audioEnabled) return;
    // Melodia dramática do Show do Milhão
    setTimeout(() => this.playTone(523, 200), 0);    // C5
    setTimeout(() => this.playTone(659, 200), 250);  // E5
    setTimeout(() => this.playTone(784, 400), 500);  // G5
    setTimeout(() => this.playTone(1047, 600), 1000); // C6
  }

  playCorrect() {
    if (!this.audioEnabled) return;
    // Som de acerto crescente
    setTimeout(() => this.playTone(440, 150), 0);
    setTimeout(() => this.playTone(554, 150), 200);
    setTimeout(() => this.playTone(659, 300), 400);
  }

  playWrong() {
    if (!this.audioEnabled) return;
    // Som dramático de erro
    this.playTone(196, 800, 'square');
  }

  playLevelUp() {
    if (!this.audioEnabled) return;
    // Fanfarra de vitória
    setTimeout(() => this.playTone(523, 100), 0);
    setTimeout(() => this.playTone(659, 100), 150);
    setTimeout(() => this.playTone(784, 100), 300);
    setTimeout(() => this.playTone(1047, 200), 450);
  }

  playVictory() {
    if (!this.audioEnabled) return;
    // Tema de vitória completa
    const melody = [523, 659, 784, 1047, 1319, 1568, 2093];
    melody.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 300), index * 150);
    });
  }

  playGameOver() {
    if (!this.audioEnabled) return;
    // Som descendente dramático
    setTimeout(() => this.playTone(440, 200), 0);
    setTimeout(() => this.playTone(369, 200), 250);
    setTimeout(() => this.playTone(311, 200), 500);
    setTimeout(() => this.playTone(261, 500), 750);
  }

  playHelp() {
    if (!this.audioEnabled) return;
    this.playTone(800, 200);
  }

  playSuspense() {
    if (!this.audioEnabled) return;
    // Batimento crescente de suspense
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(220, 100, 'triangle'), i * 300);
    }
  }

  playClick() {
    if (!this.audioEnabled) return;
    this.playTone(1000, 50);
  }
}

// Serviço de Acessibilidade
class AccessibilityService {
  private static instance: AccessibilityService;
  private ttsEnabled: boolean = false;

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  async initialize() {
    try {
      if (Tts && Platform.OS !== 'web') {
        await Tts.setDefaultLanguage('pt-BR');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);
      }
    } catch (error) {
      console.log('TTS não disponível:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.ttsEnabled = enabled;
    if (enabled) {
      this.speak('Acessibilidade ativada. O QA Milionário irá ler todas as informações.');
    }
  }

  isEnabled(): boolean {
    return this.ttsEnabled;
  }

  async speak(text: string) {
    if (!this.ttsEnabled) return;
    
    // Verificar se áudio mestre está ligado
    const audioService = AudioService.getInstance();
    if (!audioService.isEnabled()) {
      console.log('🔇 TTS bloqueado - áudio mestre desligado');
      this.stopSpeaking(); // Parar qualquer fala em andamento
      return;
    }
    
    try {
      console.log('🗣️ TTS:', text);
      if (Platform.OS === 'web') {
        // Para web, usar SpeechSynthesis API se disponível
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'pt-BR';
          utterance.rate = 0.8;
          window.speechSynthesis.speak(utterance);
        } else {
          console.log('TTS Web:', text);
        }
      } else if (Tts) {
        await Tts.speak(text);
      }
    } catch (error) {
      console.log('Erro no TTS:', error);
    }
  }

  stopSpeaking() {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          console.log('🛑 TTS Web parado');
        }
      } else if (Tts) {
        Tts.stop();
        console.log('🛑 TTS nativo parado');
      }
    } catch (error) {
      console.log('Erro ao parar TTS:', error);
    }
  }

  async readQuestion(question: Question, questionNumber: number) {
    if (!this.ttsEnabled) return;
    
    const text = `Pergunta ${questionNumber} de 20. ${question.question}. 
    Opção A: ${question.options[0]}. 
    Opção B: ${question.options[1]}. 
    Opção C: ${question.options[2]}. 
    Opção D: ${question.options[3]}.`;
    
    await this.speak(text);
  }

  async readResult(isCorrect: boolean, score: number, lives: number, correctOption?: string) {
    if (!this.ttsEnabled) return;
    
    const text = isCorrect 
      ? `Parabéns! Resposta correta! Sua pontuação atual é ${score} pontos. Você tem ${lives} vidas restantes.`
      : `Que pena! Resposta incorreta. ${correctOption ? `A resposta correta era: ${correctOption}.` : ''} Sua pontuação atual é ${score} pontos. Você tem ${lives} vidas restantes.`;
    
    await this.speak(text);
  }

  async readGameStats(score: number, lives: number) {
    if (!this.ttsEnabled) return;
    await this.speak(`Pontuação: ${score} pontos. Vidas restantes: ${lives}.`);
  }
}

const App: React.FC = () => {
  // Estados
  const [currentScreen, setCurrentScreen] = useState<'login' | 'home' | 'game' | 'result' | 'ranking'>('login');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    lives: 3,
    questions: [],
    usedHelps: { universities: false, eliminate: false, skip: false },
    gameStarted: false,
    gameFinished: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [rankings, setRankings] = useState<{name: string, score: number, date: string}[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  
  // Estados para modais customizados
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<Array<{text: string, onPress?: () => void, style?: string}>>([]);

  // Serviços
  const audioService = useRef(AudioService.getInstance()).current;
  const accessibilityService = useRef(AccessibilityService.getInstance()).current;
  
  // Função para mostrar modal customizado
  const showModal = (title: string, message: string, buttons: Array<{text: string, onPress?: () => void, style?: string}>) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };
  
  const hideModal = () => {
    setModalVisible(false);
    setModalTitle('');
    setModalMessage('');
    setModalButtons([]);
  };

  useEffect(() => {
    initializeServices();
    loadUserData();
    
    // BackHandler apenas para plataformas nativas (Android)
    if (Platform.OS === 'android') {
      const { BackHandler } = require('react-native');
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }
  }, []);

  const initializeServices = async () => {
    await accessibilityService.initialize();
  };

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('playerName');
      const audioSetting = await AsyncStorage.getItem('audioEnabled');
      const accessibilitySetting = await AsyncStorage.getItem('accessibilityEnabled');
      const savedRankings = await AsyncStorage.getItem('rankings');
      
      if (name) setPlayerName(name);
      if (audioSetting !== null) {
        const enabled = JSON.parse(audioSetting);
        setAudioEnabled(enabled);
        audioService.setEnabled(enabled);
      }
      if (accessibilitySetting !== null) {
        const enabled = JSON.parse(accessibilitySetting);
        setAccessibilityEnabled(enabled);
        accessibilityService.setEnabled(enabled);
      }
      if (savedRankings) {
        setRankings(JSON.parse(savedRankings));
      }
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  };
  
  const saveToRanking = async (playerName: string, score: number) => {
    try {
      const newEntry = {
        name: playerName,
        score: score,
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      const updatedRankings = [...rankings, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Manter apenas top 10
      
      setRankings(updatedRankings);
      await AsyncStorage.setItem('rankings', JSON.stringify(updatedRankings));
    } catch (error) {
      console.log('Erro ao salvar ranking:', error);
    }
  };

  const handleBackPress = () => {
    if (currentScreen === 'game') {
      showModal(
        'Sair do Jogo',
        'Tem certeza que deseja sair? O progresso será perdido.',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => {
              hideModal();
              audioService.playClick();
            }
          },
          { 
            text: 'Sair', 
            onPress: () => {
              hideModal();
              audioService.playClick();
              setCurrentScreen('home');
            }
          }
        ]
      );
      return true;
    }
    return false;
  };

  // Geração de perguntas com IA
  const generateQuestions = async (): Promise<Question[]> => {
    setLoading(true);
    
    try {
      const prompt = `Gere EXATAMENTE 20 perguntas diferentes e aleatórias sobre ISTQB CTFL (Certified Tester Foundation Level) em português brasileiro.

IMPORTANTE: Cada pergunta deve ser única e diferente das outras. Varie os tópicos e conceitos.

Distribua as perguntas assim:
- 8 perguntas FÁCEIS (1000 pontos cada) - conceitos básicos
- 8 perguntas MÉDIAS (2000 pontos cada) - conceitos intermediários  
- 4 perguntas DIFÍCEIS (5000 pontos cada) - conceitos avançados

Tópicos para variar: Fundamentos de teste, Processo de teste, Técnicas de teste estática, Técnicas de design de teste, Gerenciamento de teste, Ferramentas de teste, Níveis de teste, Tipos de teste, Manutenção de teste.

Retorne APENAS o JSON válido:
{
  "questions": [
    {
      "question": "Pergunta completa aqui?",
      "options": ["A) Primeira opção", "B) Segunda opção", "C) Terceira opção", "D) Quarta opção"],
      "correct": 0,
      "difficulty": "easy",
      "points": 1000
    }
  ]
}`;

      console.log('🤖 Gerando perguntas com IA Gemini 1.5 Flash...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('📤 Enviando requisição para Gemini com rotação de chaves...');
      
      const data = await tryMultipleApiKeys(requestBody, 'geração de perguntas');
      console.log('📥 Resposta da IA recebida:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('❌ Estrutura de resposta inválida:', data);
        throw new Error('Resposta da IA inválida - sem candidates ou content');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      console.log('📝 Conteúdo extraído:', content.substring(0, 300) + '...');
      
      // Extrair JSON do conteúdo - busca mais robusta
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Tentar encontrar entre ```json
        jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }
      
      if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta da IA');
      }
      
      const questionsData = JSON.parse(jsonMatch[0]);
      
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
        throw new Error('Formato de perguntas inválido');
      }

      if (questionsData.questions.length < 20) {
        throw new Error(`Apenas ${questionsData.questions.length} perguntas geradas, esperado 20`);
      }
      
      console.log(`✅ ${questionsData.questions.length} perguntas geradas com sucesso pela IA!`);
      
      const aiQuestions = questionsData.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correct: q.correct,
        difficulty: q.difficulty,
        points: q.points
      }));

      // Embaralhar as perguntas geradas pela IA
      return shuffleArray(aiQuestions);
      
    } catch (error) {
      console.error('❌ Erro ao gerar perguntas com IA:', error);
      
      // Se for erro 429, pular tentativa e ir direto para fallback
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        console.warn('⚠️ Limite de API atingido - usando banco local de perguntas');
      } else {
        console.warn('⚠️ Tentando novamente com prompt simplificado...');
        
        // Segunda tentativa com prompt mais simples
        try {
        const simplePrompt = `Crie 20 perguntas de QA/Teste de software em português brasileiro no formato JSON:

{
  "questions": [
    {
      "question": "Pergunta sobre teste de software?",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
      "correct": 0,
      "difficulty": "easy",
      "points": 1000
    }
  ]
}

Distribua: 8 fáceis (1000pts), 8 médias (2000pts), 4 difíceis (5000pts).`;

        const simpleResponse = await fetch(getGeminiApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: simplePrompt }] }]
          })
        });

        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json();
          if (simpleData.candidates?.[0]?.content?.parts?.[0]?.text) {
            const simpleContent = simpleData.candidates[0].content.parts[0].text;
            const simpleJsonMatch = simpleContent.match(/\{[\s\S]*\}/);
            if (simpleJsonMatch) {
              const simpleQuestionsData = JSON.parse(simpleJsonMatch[0]);
              if (simpleQuestionsData.questions?.length >= 10) {
                console.log('✅ Segunda tentativa bem-sucedida!');
                return shuffleArray(simpleQuestionsData.questions.map((q: any, index: number) => ({
                  id: index + 1,
                  question: q.question,
                  options: q.options,
                  correct: q.correct,
                  difficulty: q.difficulty || 'easy',
                  points: q.points || 1000
                })));
              }
            }
          }
        }
      } catch (retryError) {
        console.error('❌ Segunda tentativa também falhou:', retryError);
      }
      } // Fechando o else
      
      console.warn('🔄 Usando banco de perguntas local (garantia de funcionamento)');
      
      // Banco de perguntas de fallback extenso e variado - ISTQB CTFL
      const fallbackQuestions = [
        // FÁCEIS (1000 pontos) - 8 perguntas
        {
          id: 1,
          question: "O que é teste de software segundo o ISTQB?",
          options: ["A) Apenas encontrar defeitos", "B) Processo de verificação e validação", "C) Só executar código", "D) Documentar bugs"],
          correct: 1,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 2,
          question: "Qual é o principal objetivo do teste de software?",
          options: ["A) Provar que não há defeitos", "B) Encontrar todos os defeitos", "C) Reduzir o risco de falhas", "D) Acelerar o desenvolvimento"],
          correct: 2,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 3,
          question: "O que são casos de teste?",
          options: ["A) Apenas dados de entrada", "B) Especificações de como testar", "C) Relatórios de defeitos", "D) Códigos de programa"],
          correct: 1,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 4,
          question: "O que é um defeito em software?",
          options: ["A) Uma funcionalidade", "B) Um requisito", "C) Uma falha no código", "D) Um teste executado"],
          correct: 2,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 5,
          question: "Qual a diferença entre erro e defeito?",
          options: ["A) São a mesma coisa", "B) Erro é humano, defeito é no código", "C) Defeito é mais grave", "D) Não há diferença"],
          correct: 1,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 6,
          question: "O que é teste estático?",
          options: ["A) Teste sem executar código", "B) Teste muito lento", "C) Teste automatizado", "D) Teste de performance"],
          correct: 0,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 7,
          question: "O que é teste dinâmico?",
          options: ["A) Teste muito rápido", "B) Teste executando o software", "C) Teste de revisão", "D) Teste de interface"],
          correct: 1,
          difficulty: 'easy' as const,
          points: 1000
        },
        {
          id: 8,
          question: "Quantos princípios de teste existem no ISTQB?",
          options: ["A) 5 princípios", "B) 6 princípios", "C) 7 princípios", "D) 8 princípios"],
          correct: 2,
          difficulty: 'easy' as const,
          points: 1000
        },

        // MÉDIAS (2000 pontos) - 8 perguntas
        {
          id: 9,
          question: "Qual técnica é exemplo de caixa-preta?",
          options: ["A) Cobertura de código", "B) Partição por equivalência", "C) Teste de fluxo de dados", "D) Análise de mutação"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 10,
          question: "O que é análise de valor limite?",
          options: ["A) Testar apenas valores máximos", "B) Testar valores nas bordas das partições", "C) Testar valores aleatórios", "D) Testar apenas valores mínimos"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 11,
          question: "Qual é a ordem correta dos níveis de teste?",
          options: ["A) Sistema, Integração, Unidade, Aceite", "B) Unidade, Integração, Sistema, Aceite", "C) Aceite, Sistema, Integração, Unidade", "D) Integração, Unidade, Sistema, Aceite"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 12,
          question: "O que caracteriza o teste de regressão?",
          options: ["A) Testar novos recursos", "B) Repetir testes após mudanças", "C) Testar performance", "D) Testar usabilidade"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 13,
          question: "O que é cobertura de decisão?",
          options: ["A) Cobrir todas as linhas", "B) Cobrir todos os caminhos true/false", "C) Cobrir todas as funções", "D) Cobrir todos os módulos"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 14,
          question: "Qual fase do processo de teste vem primeiro?",
          options: ["A) Execução", "B) Planejamento", "C) Análise", "D) Implementação"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 15,
          question: "O que é teste exploratório?",
          options: ["A) Teste sem planejamento", "B) Aprendizado, design e execução simultâneos", "C) Teste automatizado", "D) Teste de stress"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },
        {
          id: 16,
          question: "O que caracteriza o modelo V?",
          options: ["A) Desenvolvimento linear", "B) Cada fase de dev tem fase de teste correspondente", "C) Apenas para projetos ágeis", "D) Sem documentação"],
          correct: 1,
          difficulty: 'medium' as const,
          points: 2000
        },

        // DIFÍCEIS (5000 pontos) - 4 perguntas
        {
          id: 17,
          question: "Na técnica de teste de transição de estados, o que é um estado inválido?",
          options: ["A) Estado que nunca é alcançado", "B) Estado não especificado no modelo", "C) Estado de erro do sistema", "D) Estado inicial do sistema"],
          correct: 1,
          difficulty: 'hard' as const,
          points: 5000
        },
        {
          id: 18,
          question: "O que é cobertura MC/DC (Modified Condition/Decision Coverage)?",
          options: ["A) Cobrir todas as decisões", "B) Cada condição independentemente afeta o resultado", "C) Cobrir todas as condições", "D) Cobrir todos os caminhos"],
          correct: 1,
          difficulty: 'hard' as const,
          points: 5000
        },
        {
          id: 19,
          question: "No teste baseado em risco, qual é o fator mais importante?",
          options: ["A) Complexidade técnica apenas", "B) Probabilidade × Impacto", "C) Tempo disponível apenas", "D) Recursos da equipe apenas"],
          correct: 1,
          difficulty: 'hard' as const,
          points: 5000
        },
        {
          id: 20,
          question: "O que caracteriza o teste de mutação?",
          options: ["A) Testar com dados aleatórios", "B) Introduzir defeitos artificiais para avaliar testes", "C) Testar múltiplas versões", "D) Testar mudanças de requisitos"],
          correct: 1,
          difficulty: 'hard' as const,
          points: 5000
        }
      ];
      
      // Embaralhar as perguntas para maior variação
      const shuffled = [...fallbackQuestions].sort(() => Math.random() - 0.5);
      
      console.log('🔄 Usando banco de perguntas de fallback (20 perguntas variadas)');
      return shuffled;
    } finally {
      setLoading(false);
    }
  };

  // Função para embaralhar array
  const shuffleArray = (array: Question[]): Question[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Iniciar novo jogo
  const startNewGame = async () => {
    audioService.playIntro();
    await accessibilityService.speak('Iniciando novo jogo do QA Milionário!');
    
    const questions = await generateQuestions();
    
    // Embaralhar perguntas para maior variação a cada jogo
    const shuffledQuestions = shuffleArray(questions);
    
    // Garantir ordem de dificuldade: fáceis primeiro, depois médias, depois difíceis
    const easyQuestions = shuffledQuestions.filter(q => q.difficulty === 'easy').slice(0, 8);
    const mediumQuestions = shuffledQuestions.filter(q => q.difficulty === 'medium').slice(0, 8);
    const hardQuestions = shuffledQuestions.filter(q => q.difficulty === 'hard').slice(0, 4);
    
    const orderedQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    
    console.log(`🎮 Jogo iniciado com ${orderedQuestions.length} perguntas:`, {
      fáceis: easyQuestions.length,
      médias: mediumQuestions.length,
      difíceis: hardQuestions.length
    });
    
    setGameState({
      currentQuestion: 0,
      score: 0,
      lives: 3,
      questions: orderedQuestions,
      usedHelps: { universities: false, eliminate: false, skip: false },
      gameStarted: true,
      gameFinished: false,
    });
    
    setSelectedAnswer(null);
    setEliminatedOptions([]);
    setCurrentScreen('game');
    
    // Ler primeira pergunta
    if (orderedQuestions.length > 0) {
      setTimeout(() => {
        accessibilityService.readQuestion(orderedQuestions[0], 1);
      }, 1000);
    }
  };

  // Responder pergunta
  const answerQuestion = async (selectedIndex: number) => {
    console.log('🎯 answerQuestion chamada:', selectedIndex);
    console.log('🎯 selectedAnswer atual:', selectedAnswer);
    console.log('🎯 gameState:', gameState);
    
    if (selectedAnswer !== null) {
      console.log('❌ Resposta já selecionada, ignorando');
      return;
    }
    
    const currentQ = gameState.questions[gameState.currentQuestion];
    const selectedOption = currentQ.options[selectedIndex];
    
    console.log('✅ Mostrando confirmação para:', selectedOption);
    
    // Confirmação antes de submeter a resposta
    showModal(
      '🤔 Confirmar Resposta',
      `Você selecionou:\n\n${selectedOption}\n\nTem certeza que esta é sua resposta final?`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            console.log('❌ Resposta cancelada');
            audioService.playClick();
            hideModal();
          }
        },
        { 
          text: 'Confirmar', 
          onPress: () => {
            console.log('✅ Resposta confirmada');
            audioService.playClick();
            hideModal();
            processAnswer(selectedIndex);
          }
        }
      ]
    );
  };

  // Processar resposta confirmada
  const processAnswer = async (selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);
    audioService.playSuspense();
    
    const currentQ = gameState.questions[gameState.currentQuestion];
    const isCorrect = selectedIndex === currentQ.correct;
    
    setTimeout(async () => {
      if (isCorrect) {
        audioService.playCorrect();
        const newScore = gameState.score + currentQ.points;
        
        setGameState(prev => ({
          ...prev,
          score: newScore,
          currentQuestion: prev.currentQuestion + 1
        }));
        
        await accessibilityService.readResult(true, newScore, gameState.lives);
        
        if (gameState.currentQuestion + 1 >= gameState.questions.length) {
          // Jogo completo
          audioService.playVictory();
          await accessibilityService.speak(`Parabéns! Você completou o QA Milionário com ${newScore} pontos!`);
          
          setGameState(prev => ({ ...prev, gameFinished: true }));
          await saveToRanking(playerName, newScore);
          setCurrentScreen('result');
        } else {
          // Próxima pergunta
          audioService.playLevelUp();
          setTimeout(() => {
            setSelectedAnswer(null);
            setEliminatedOptions([]);
            const nextQ = gameState.questions[gameState.currentQuestion + 1];
            accessibilityService.readQuestion(nextQ, gameState.currentQuestion + 2);
          }, 2000);
        }
      } else {
        audioService.playWrong();
        const newLives = gameState.lives - 1;
        
        setGameState(prev => ({
          ...prev,
          lives: newLives
        }));
        
        const correctAnswer = gameState.questions[gameState.currentQuestion].options[gameState.questions[gameState.currentQuestion].correct];
        await accessibilityService.readResult(false, gameState.score, newLives, correctAnswer);
        
        if (newLives <= 0) {
          // Game Over
          audioService.playGameOver();
          await accessibilityService.speak(`Game Over! Sua pontuação final foi ${gameState.score} pontos.`);
          
          setGameState(prev => ({ ...prev, gameFinished: true }));
          await saveToRanking(playerName, gameState.score);
          setCurrentScreen('result');
        } else {
          // Continuar jogo
          setTimeout(() => {
            setSelectedAnswer(null);
            setEliminatedOptions([]);
            const nextQ = gameState.questions[gameState.currentQuestion + 1];
            accessibilityService.readQuestion(nextQ, gameState.currentQuestion + 2);
          }, 2000);
        }
      }
    }, 2000);
  };

  // Ajuda dos Universitários
  const useUniversitiesHelp = async () => {
    console.log('🎓 Botão Universitários clicado');
    if (gameState.usedHelps.universities) {
      console.log('❌ Ajuda já usada');
      return;
    }
    
    console.log('✅ Processando ajuda dos universitários...');
    audioService.playHelp();
    setLoading(true);
    
    try {
      const currentQ = gameState.questions[gameState.currentQuestion];
      const prompt = `Como universitários especialistas em ISTQB, analisem esta pergunta e deem uma dica sobre qual seria a resposta mais provável, sem revelar diretamente a resposta:

      Pergunta: ${currentQ.question}
      A) ${currentQ.options[0]}
      B) ${currentQ.options[1]} 
      C) ${currentQ.options[2]}
      D) ${currentQ.options[3]}
      
      Respondam como se fossem 3 universitários discutindo brevemente. Máximo 150 palavras.`;

      console.log('📤 Enviando pergunta para IA com rotação de chaves...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      };

      const data = await tryMultipleApiKeys(requestBody, 'ajuda dos universitários');
      console.log('📥 Resposta da API:', JSON.stringify(data, null, 2));
      
      // Verificação mais robusta da estrutura da resposta
      if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('❌ Sem candidates na resposta:', data);
        throw new Error('NO_CANDIDATES');
      }
      
      const candidate = data.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
        console.error('❌ Estrutura de candidate inválida:', candidate);
        throw new Error('INVALID_CANDIDATE_STRUCTURE');
      }
      
      const advice = candidate.content.parts[0].text;
      if (!advice || advice.trim().length === 0) {
        console.error('❌ Texto vazio na resposta');
        throw new Error('EMPTY_RESPONSE');
      }
      
      console.log('📝 Conselho extraído:', advice.substring(0, 100) + '...');
      
      setTimeout(() => {
        showModal('💡 Ajuda dos Universitários', advice, [
          { 
            text: 'OK', 
            onPress: () => {
              hideModal();
              audioService.playClick();
            }
          }
        ]);
        accessibilityService.speak(`Ajuda dos Universitários: ${advice}`);
      }, 100);
      
      setGameState(prev => ({
        ...prev,
        usedHelps: { ...prev.usedHelps, universities: true }
      }));
      
    } catch (error) {
      console.error('❌ Erro na ajuda dos universitários:', error);
      
      // Mensagens específicas baseadas no tipo de erro
      let errorTitle = '💡 Ajuda dos Universitários';
      let errorMessage = '';
      
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        errorTitle = '⏰ Limite de Uso Atingido';
        errorMessage = `🚫 A IA atingiu o limite de consultas por hoje.\n\nMas não se preocupe! Aqui está uma dica dos nossos especialistas:\n\n`;
      } else if (error.message === 'API_KEY_INVALID') {
        errorTitle = '🔑 Problema de Configuração';
        errorMessage = `⚙️ Problema temporário na conexão com a IA.\n\nEnquanto isso, nossos especialistas recomendam:\n\n`;
      } else {
        errorTitle = '💡 Ajuda dos Universitários';
        errorMessage = `🌐 IA temporariamente indisponível.\n\nAqui está uma dica valiosa:\n\n`;
      }
      
      // Fallback com dicas genéricas inteligentes baseadas na pergunta
      const currentQ = gameState.questions[gameState.currentQuestion];
      const fallbackAdvices = [
        "👨‍🎓 **Prof. Silva (ISTQB Expert):** 'Lembre-se dos conceitos fundamentais do ISTQB. A resposta geralmente está relacionada às boas práticas de teste.'\n\n👩‍🎓 **Dra. Santos:** 'Considere o contexto da pergunta e elimine as opções que claramente não fazem sentido.'\n\n👨‍🎓 **Prof. Costa:** 'Pense na aplicação prática - qual resposta faria mais sentido em um projeto real?'",
        
        "👩‍🎓 **Dra. Oliveira:** 'Esta pergunta parece ser sobre processo de teste. Lembre-se da sequência lógica das atividades.'\n\n👨‍🎓 **Prof. Lima:** 'Considere os níveis de teste e quando cada um é aplicado no ciclo de desenvolvimento.'\n\n👩‍🎓 **Dra. Ferreira:** 'A resposta correta geralmente segue as definições padrão do ISTQB. Confie nos conceitos básicos!'",
        
        "👨‍🎓 **Prof. Martins:** 'Analise cada opção cuidadosamente. No ISTQB, a terminologia é muito específica e precisa.'\n\n👩‍🎓 **Dra. Rocha:** 'Pense na diferença entre conceitos similares - isso é muito comum nas certificações.'\n\n👨‍🎓 **Prof. Alves:** 'Quando em dúvida, escolha a opção mais abrangente e que segue as melhores práticas.'"
      ];
      
      const randomAdvice = fallbackAdvices[Math.floor(Math.random() * fallbackAdvices.length)];
      
      setTimeout(() => {
        showModal(errorTitle, errorMessage + randomAdvice, [
          { 
            text: 'Entendi', 
            onPress: () => {
              hideModal();
              audioService.playClick();
            }
          }
        ]);
        accessibilityService.speak(`Ajuda dos universitários: ${randomAdvice}`);
      }, 100);
      
      setGameState(prev => ({
        ...prev,
        usedHelps: { ...prev.usedHelps, universities: true }
      }));
      
    } finally {
      setLoading(false);
    }
  };

  // Eliminar 2 alternativas
  const useEliminateHelp = () => {
    console.log('❌ Botão Eliminar clicado');
    if (gameState.usedHelps.eliminate) {
      console.log('❌ Ajuda já usada');
      return;
    }
    
    console.log('✅ Eliminando alternativas...');
    audioService.playHelp();
    const currentQ = gameState.questions[gameState.currentQuestion];
    const correctIndex = currentQ.correct;
    
    // Escolher 2 opções incorretas para eliminar
    const incorrectOptions = [0, 1, 2, 3].filter(i => i !== correctIndex);
    const toEliminate = incorrectOptions.slice(0, 2);
    
    console.log('🗑️ Eliminando opções:', toEliminate);
    
    setEliminatedOptions(toEliminate);
    setGameState(prev => ({
      ...prev,
      usedHelps: { ...prev.usedHelps, eliminate: true }
    }));
    
    accessibilityService.speak('Duas alternativas incorretas foram eliminadas.');
  };

  // Pular pergunta
  const useSkipHelp = () => {
    console.log('⏭️ Botão Pular clicado');
    if (gameState.usedHelps.skip) {
      console.log('❌ Ajuda já usada');
      return;
    }
    
    console.log('✅ Confirmando pular pergunta...');
    
    setTimeout(() => {
      showModal(
        '⏭️ Pular Pergunta',
        'Tem certeza que deseja pular esta pergunta? Esta ajuda só pode ser usada uma vez.',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => {
              hideModal();
              audioService.playClick();
            }
          },
          { 
            text: 'Pular', 
            onPress: () => {
              console.log('✅ Pergunta pulada');
              hideModal();
              audioService.playHelp();
              
              setGameState(prev => ({
                ...prev,
                currentQuestion: prev.currentQuestion + 1,
                usedHelps: { ...prev.usedHelps, skip: true }
              }));
              
              setSelectedAnswer(null);
              setEliminatedOptions([]);
              
              accessibilityService.speak('Pergunta pulada. Próxima pergunta.');
              
              if (gameState.currentQuestion + 1 < gameState.questions.length) {
                setTimeout(() => {
                  const nextQ = gameState.questions[gameState.currentQuestion + 1];
                  accessibilityService.readQuestion(nextQ, gameState.currentQuestion + 2);
                }, 1000);
              }
            }
          }
        ]
      );
    }, 100);
  };

  // Toggle de áudio mestre (controla tanto efeitos sonoros quanto TTS)
  const toggleAudio = async () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    
    // Controlar efeitos sonoros
    audioService.setEnabled(newState);
    
    // Controlar TTS de acessibilidade também
    if (!newState) {
      // Se desligando áudio, parar TTS imediatamente e desligar
      accessibilityService.stopSpeaking();
      setAccessibilityEnabled(false);
      accessibilityService.setEnabled(false);
      await AsyncStorage.setItem('accessibilityEnabled', JSON.stringify(false));
      console.log('🔇 Áudio mestre desligado - TTS parado e desabilitado');
    } else {
      // Se ligando áudio, manter TTS no estado anterior
      // (usuário pode controlar TTS separadamente se quiser)
      audioService.playClick();
      console.log('🔊 Áudio mestre ligado');
    }
    
    await AsyncStorage.setItem('audioEnabled', JSON.stringify(newState));
    
    // Feedback sonoro apenas se áudio estiver ligado
    if (newState) {
      setTimeout(() => {
        audioService.playIntro();
      }, 100);
    }
  };

  // Toggle de acessibilidade (TTS)
  const toggleAccessibility = async () => {
    // Só permite ativar TTS se áudio mestre estiver ligado
    if (!audioEnabled && !accessibilityEnabled) {
      showModal(
        '🔇 Áudio Desligado',
        'Para usar a acessibilidade, primeiro ative o áudio mestre.',
        [{ 
          text: 'OK',
          onPress: () => {
            hideModal();
            audioService.playClick();
          }
        }]
      );
      return;
    }
    
    const newState = !accessibilityEnabled;
    
    if (!newState) {
      // Se desligando acessibilidade, parar TTS imediatamente
      accessibilityService.stopSpeaking();
      console.log('🛑 Acessibilidade desligada - TTS parado');
    }
    
    setAccessibilityEnabled(newState);
    accessibilityService.setEnabled(newState);
    await AsyncStorage.setItem('accessibilityEnabled', JSON.stringify(newState));
    
    if (newState && audioEnabled) {
      accessibilityService.speak('Acessibilidade ativada. O jogo irá ler todas as informações.');
    }
  };

  // Renderização das telas
  const renderLoginScreen = () => (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
        
        
        <View style={styles.loginContainer}>
          <Text style={styles.title}>🏆 QA MILIONÁRIO</Text>
          <Text style={styles.subtitle}>O Quiz Definitivo de QA</Text>
        
        <TextInput
          style={styles.nameInput}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={playerName}
          onChangeText={setPlayerName}
          maxLength={20}
          autoCapitalize="words"
        />
        
        <TouchableOpacity 
          style={[styles.loginButton, !playerName.trim() && styles.loginButtonDisabled]}
          onPress={() => {
            if (playerName.trim()) {
              setCurrentScreen('home');
              audioService.playIntro();
              accessibilityService.speak(`Bem-vindo ao QA Milionário, ${playerName}!`);
            } else {
              showModal('Nome obrigatório', 'Por favor, digite seu nome para continuar.', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    hideModal();
                    audioService.playClick();
                  }
                }
              ]);
            }
          }}
          disabled={!playerName.trim()}
        >
          <Text style={styles.loginButtonText}>ENTRAR</Text>
        </TouchableOpacity>
        
        <View style={styles.settingsContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, audioEnabled && styles.toggleButtonActive]}
            onPress={toggleAudio}
          >
            <Text style={styles.toggleButtonText}>
              🔊 Áudio Mestre: {audioEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, accessibilityEnabled && styles.toggleButtonActive]}
            onPress={toggleAccessibility}
            disabled={!audioEnabled}
          >
            <Text style={[
              styles.toggleButtonText,
              !audioEnabled && { opacity: 0.5 }
            ]}>
              ♿ Acessibilidade: {accessibilityEnabled && audioEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <View style={styles.homeContainer}>
        <Text style={styles.title}>🏆 QA MILIONÁRIO</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>• 20 Perguntas ISTQB CTFL</Text>
          <Text style={styles.infoText}>• 3 Níveis de Dificuldade</Text>
          <Text style={styles.infoText}>• 3 Vidas</Text>
          <Text style={styles.infoText}>• 3 Ajudas Especiais</Text>
          <Text style={styles.infoText}>• Pontuação Máxima: 44.000 pts</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={startNewGame}
          disabled={loading}
        >
          <Text style={styles.playButtonText}>
            {loading ? 'GERANDO PERGUNTAS...' : '🎯 JOGAR AGORA'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.rankingButton}
          onPress={() => setCurrentScreen('ranking')}
        >
          <Text style={styles.rankingButtonText}>🏆 RANKING</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('login')}
        >
          <Text style={styles.backButtonText}>← VOLTAR</Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <Modal transparent visible={loading}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ffd700" />
              <Text style={styles.loadingText}>Gerando perguntas com IA...</Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );

  const renderGameScreen = () => {
    console.log('🎮 renderGameScreen - loading:', loading);
    console.log('🎮 gameState.questions.length:', gameState.questions.length);
    console.log('🎮 selectedAnswer:', selectedAnswer);
    console.log('🎮 currentScreen:', currentScreen);
    
    if (gameState.questions.length === 0) {
      console.log('🎮 Retornando null - sem perguntas');
      return null;
    }
    
    const currentQ = gameState.questions[gameState.currentQuestion];
    const questionNumber = gameState.currentQuestion + 1;
    const progress = (questionNumber / 20) * 100;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
        
        
        {/* Header do Jogo */}
        <View style={styles.gameHeader}>
          <View style={styles.gameStats}>
            <Text style={styles.statText}>💰 {gameState.score}</Text>
            <Text style={styles.statText}>❤️ {gameState.lives}</Text>
            <Text style={styles.statText}>{questionNumber}/20</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        
        {/* Pergunta */}
        <ScrollView style={styles.gameContent}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>Pergunta {questionNumber}</Text>
            <Text style={styles.questionText}>{currentQ.question}</Text>
            <Text style={styles.questionPoints}>Vale: {currentQ.points} pontos</Text>
          </View>
          
          {/* Opções */}
          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => {
              const isEliminated = eliminatedOptions.includes(index);
              const isSelected = selectedAnswer === index;
              // Só mostrar cores APÓS uma resposta ser selecionada E confirmada
              const isCorrect = selectedAnswer !== null && isSelected && index === currentQ.correct;
              const isWrong = selectedAnswer !== null && isSelected && index !== currentQ.correct;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isEliminated && styles.optionEliminated,
                    isCorrect && styles.optionCorrect,
                    isWrong && styles.optionWrong,
                  ]}
                  onPress={() => {
                    console.log('🔥 CLIQUE DETECTADO NA OPÇÃO:', index, option);
                    console.log('🔥 isEliminated:', isEliminated);
                    console.log('🔥 selectedAnswer:', selectedAnswer);
                    if (!isEliminated && selectedAnswer === null) {
                      console.log('🔥 CHAMANDO answerQuestion...');
                      answerQuestion(index);
                    } else {
                      console.log('🔥 CLIQUE IGNORADO - Condições não atendidas');
                    }
                  }}
                  disabled={isEliminated || selectedAnswer !== null}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isEliminated && styles.optionTextEliminated
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Ajudas */}
        <View style={styles.helpsContainer}>
          <TouchableOpacity
            style={[styles.helpButton, gameState.usedHelps.universities && styles.helpButtonUsed]}
            onPress={() => {
              console.log('🎓 Botão Universitários pressionado');
              console.log('🎓 loading:', loading);
              console.log('🎓 usedHelps.universities:', gameState.usedHelps.universities);
              console.log('🎓 selectedAnswer:', selectedAnswer);
              useUniversitiesHelp();
            }}
            disabled={gameState.usedHelps.universities || selectedAnswer !== null || loading}
          >
            <Text style={styles.helpButtonText}>🎓 Universitários</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.helpButton, gameState.usedHelps.eliminate && styles.helpButtonUsed]}
            onPress={() => {
              console.log('❌ Botão Eliminar pressionado');
              console.log('❌ loading:', loading);
              console.log('❌ usedHelps.eliminate:', gameState.usedHelps.eliminate);
              console.log('❌ selectedAnswer:', selectedAnswer);
              useEliminateHelp();
            }}
            disabled={gameState.usedHelps.eliminate || selectedAnswer !== null || loading}
          >
            <Text style={styles.helpButtonText}>❌ Eliminar 2</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.helpButton, gameState.usedHelps.skip && styles.helpButtonUsed]}
            onPress={() => {
              console.log('⏭️ Botão Pular pressionado');
              console.log('⏭️ loading:', loading);
              console.log('⏭️ usedHelps.skip:', gameState.usedHelps.skip);
              console.log('⏭️ selectedAnswer:', selectedAnswer);
              useSkipHelp();
            }}
            disabled={gameState.usedHelps.skip || selectedAnswer !== null || loading}
          >
            <Text style={styles.helpButtonText}>⏭️ Pular</Text>
          </TouchableOpacity>
        </View>
        
        {/* Controles do Jogo */}
        <View style={styles.gameControlsContainer}>
          <TouchableOpacity
            style={styles.gameControlButton}
            onPress={() => {
              console.log('🚪 Botão Desistir clicado');
              console.log('🚪 loading:', loading);
              console.log('🚪 gameState:', gameState);
              setTimeout(() => {
                showModal(
                  '🚪 Desistir do Jogo?',
                  'Tem certeza que deseja desistir? Você receberá os pontos acumulados até agora.',
                  [
                    { 
                      text: 'Continuar Jogando', 
                      style: 'cancel',
                      onPress: () => {
                        hideModal();
                        audioService.playClick();
                      }
                    },
                    { 
                      text: 'Desistir', 
                      onPress: () => {
                        console.log('✅ Confirmado: Desistir do jogo');
                        hideModal();
                        audioService.playClick();
                        audioService.playGameOver();
                        
                        // Marcar jogo como finalizado e salvar no ranking
                        setGameState(prev => ({ ...prev, gameFinished: true }));
                        saveToRanking(playerName, gameState.score);
                        
                        accessibilityService.speak(`Você desistiu com ${gameState.score} pontos. Sua pontuação foi salva no ranking.`);
                        setCurrentScreen('result');
                      }
                    }
                  ]
                );
              }, 100);
            }}
          >
            <Text style={styles.gameControlButtonText}>🚪 Desistir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gameControlButton}
            onPress={() => {
              console.log('🔄 Botão Reiniciar clicado');
              console.log('🔄 loading:', loading);
              console.log('🔄 gameState:', gameState);
              setTimeout(() => {
                showModal(
                  '🔄 Reiniciar Jogo?',
                  'Tem certeza que deseja reiniciar? Todo o progresso atual será perdido.',
                  [
                    { 
                      text: 'Cancelar', 
                      style: 'cancel',
                      onPress: () => {
                        hideModal();
                        audioService.playClick();
                      }
                    },
                    { 
                      text: 'Reiniciar', 
                      onPress: () => {
                        console.log('✅ Confirmado: Reiniciar jogo');
                        hideModal();
                        audioService.playClick();
                        
                        // Resetar estados do jogo atual
                        setSelectedAnswer(null);
                        setEliminatedOptions([]);
                        
                        accessibilityService.speak('Reiniciando o jogo...');
                        
                        // Iniciar novo jogo
                        startNewGame();
                      }
                    }
                  ]
                );
              }, 100);
            }}
          >
            <Text style={styles.gameControlButtonText}>🔄 Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const renderRankingScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <View style={styles.resultContainer}>
        <Text style={styles.title}>🏆 RANKING TOP 10</Text>
        
        <ScrollView style={styles.rankingContainer}>
          {rankings.length === 0 ? (
            <View style={styles.emptyRanking}>
              <Text style={styles.emptyRankingText}>
                🎯 Nenhuma pontuação ainda!{'\n'}
                Seja o primeiro a jogar!
              </Text>
            </View>
          ) : (
            rankings.map((entry, index) => (
              <View key={index} style={[
                styles.rankingItem,
                index < 3 && styles.topThree
              ]}>
                <View style={styles.rankingPosition}>
                  <Text style={styles.positionText}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                  </Text>
                </View>
                
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.rankingDate}>
                    {entry.date}
                  </Text>
                </View>
                
                <View style={styles.rankingScore}>
                  <Text style={styles.rankingScoreText}>
                    {entry.score}
                  </Text>
                  <Text style={styles.rankingScoreLabel}>
                    pts
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderResultScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <View style={styles.resultContainer}>
        <Text style={styles.title}>🏆 RESULTADO FINAL</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.finalScore}>{gameState.score}</Text>
          <Text style={styles.scoreLabel}>PONTOS</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statItem}>
            Perguntas respondidas: {gameState.currentQuestion}/20
          </Text>
          <Text style={styles.statItem}>
            Vidas restantes: {gameState.lives}
          </Text>
          <Text style={styles.statItem}>
            Ajudas usadas: {Object.values(gameState.usedHelps).filter(Boolean).length}/3
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={startNewGame}
        >
          <Text style={styles.playButtonText}>🎯 JOGAR NOVAMENTE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← MENU PRINCIPAL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Botão flutuante de áudio mestre
  const renderAudioButton = () => (
    <TouchableOpacity
      style={[
        styles.floatingAudioButton,
        !audioEnabled && styles.floatingAudioButtonMuted
      ]}
      onPress={toggleAudio}
    >
      <Text style={styles.floatingAudioText}>
        {audioEnabled ? '🔊' : '🔇'}
      </Text>
    </TouchableOpacity>
  );

  // Componente de Modal Customizado
  const renderCustomModal = () => (
    <Modal transparent visible={modalVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          
          <View style={styles.modalButtonsContainer}>
            {modalButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalButton,
                  button.style === 'cancel' && styles.modalButtonCancel
                ]}
                onPress={button.onPress}
              >
                <Text style={[
                  styles.modalButtonText,
                  button.style === 'cancel' && styles.modalButtonTextCancel
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Renderização principal
  
  return (
    <>
      {currentScreen === 'login' && renderLoginScreen()}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'game' && renderGameScreen()}
      {currentScreen === 'result' && renderResultScreen()}
      {currentScreen === 'ranking' && renderRankingScreen()}
      {renderAudioButton()}
      {renderCustomModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1a237e',
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  settingsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 5,
    minWidth: 200,
  },
  toggleButtonActive: {
    backgroundColor: '#4caf50',
  },
  toggleButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginVertical: 30,
    width: '100%',
  },
  infoText: {
    color: '#ffffff',
    fontSize: 16,
    marginVertical: 3,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginVertical: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#1a237e',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 15,
  },
  gameHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 3,
  },
  gameContent: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  questionNumber: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 10,
  },
  questionPoints: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionEliminated: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    opacity: 0.5,
  },
  optionCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4caf50',
  },
  optionWrong: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: '#f44336',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  optionTextEliminated: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  helpsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  helpButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  helpButtonUsed: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffd700',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scoreLabel: {
    fontSize: 20,
    color: '#ffffff',
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  statItem: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 3,
  },
  gameControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  gameControlButton: {
    backgroundColor: '#8B4513',
    padding: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameControlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankingButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  rankingContainer: {
    flex: 1,
    width: '100%',
    marginVertical: 20,
  },
  emptyRanking: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyRankingText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topThree: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  rankingPosition: {
    width: 50,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rankingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  rankingName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  rankingDate: {
    color: '#bbbbbb',
    fontSize: 12,
  },
  rankingScore: {
    alignItems: 'center',
    minWidth: 80,
  },
  rankingScoreText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankingScoreLabel: {
    color: '#bbbbbb',
    fontSize: 10,
  },
  floatingAudioButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  floatingAudioButtonMuted: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderColor: '#FF6B6B',
  },
  floatingAudioText: {
    fontSize: 24,
  },
  
  // Estilos do Modal Customizado
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a237e',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#757575',
    borderColor: '#CCCCCC',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButtonTextCancel: {
    color: '#ffffff',
  },
});

export default App; 