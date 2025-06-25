const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const isDev = process.env.ELECTRON_ENV === 'development';

// Configurações específicas para Mac Intel
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--disable-gpu-sandbox');
  app.commandLine.appendSwitch('--disable-software-rasterizer');
  app.commandLine.appendSwitch('--disable-gpu-compositing');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
}

// Manter referência da janela principal
let mainWindow;
let localServer;

// Criar servidor HTTP local
function createLocalServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      console.log('Requisição:', req.url);
      
      let filePath = path.join(__dirname, 'dist-web', req.url === '/' ? 'index.html' : req.url);
      
      // Remover query parameters
      if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
      }
      
      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        console.log('Arquivo não encontrado:', filePath);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      // Determinar Content-Type
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (ext) {
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.ico':
          contentType = 'image/x-icon';
          break;
      }
      
      // Ler e servir arquivo
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error('Erro ao ler arquivo:', err);
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
    
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`Servidor local iniciado na porta ${port}`);
      resolve({ server, port });
    });
  });
}

function createWindow() {
  // Criar janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon-512.png'),
    title: 'QA Milionário',
    show: false,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'default'
  });

  // Carregar a aplicação
  const loadApp = async () => {
    let startUrl;
    
    if (isDev) {
      startUrl = 'http://localhost:8081';
    } else {
      // Criar servidor local
      const { server, port } = await createLocalServer();
      localServer = server;
      startUrl = `http://127.0.0.1:${port}`;
    }
    
    console.log('Carregando URL:', startUrl);
    
    mainWindow.loadURL(startUrl).catch(err => {
      console.error('Erro ao carregar URL:', err);
      dialog.showErrorBox('Erro', 'Não foi possível carregar a aplicação.');
    });
  };
  
  loadApp();

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Janela pronta e exibida');
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Tratar erros de carregamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
    dialog.showErrorBox('Erro de Carregamento', `Código: ${errorCode}\nDescrição: ${errorDescription}`);
  });

  // Log de console da aplicação
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Console:', level, message);
  });

  // Log quando DOM estiver pronto
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM pronto');
  });

  // Abrir links externos no navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Fechar servidor local
    if (localServer) {
      localServer.close();
    }
  });
}

// Menu simples
function createMenu() {
  const template = [
    {
      label: 'QA Milionário',
      submenu: [
        {
          label: 'Sobre o QA Milionário',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre o QA Milionário',
              message: 'QA Milionário v1.0.2',
              detail: 'O quiz definitivo de QA com IA, modais customizados e acessibilidade completa.\n\nDesenvolvido por Ewerton Alexandre\nGitHub: @Ewertonalex',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Configurações do app
app.whenReady().then(() => {
  console.log('App pronto, criando janela...');
  createWindow();
  createMenu();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Tratar erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
}); 