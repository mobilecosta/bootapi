const { Client, LocalAuth, MessageMedia, Buttons } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const gptServices = require("../services/gptservices");
const contextServices = require("../services/contextServices");

// Instanciando as classes
const gptInstance = new gptServices();
const contextInstance = new contextServices();

const client = new Client({
  puppeteer: {
    headless: false,
    // args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
    // defaultViewport: chrome.defaultViewport,
    // executablePath: chrome.executablePath,
    ignoreHTTPSErrors: true,
  },
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
});

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});


client.on("message", async (msg) => {
  const chat = await msg.getChat();
  
  if (!chat.isGroup) {
    console.log(chat);
    // verifica se um arquivo existe
    const sessionID = msg.from.replace("@c.us", "");
    if (contextInstance.isContextExist(sessionID)) {
      if (msg.body.toLocaleLowerCase().startsWith("!funcoes")) {
        await chat.sendMessage("📌 *Funções disponíveis*");
        let button = new Buttons('Button body', [{ body: 'Aceptar' }, { body: 'rechazar' }], 'title', 'footer');
        await client.sendMessage(msg.from, button);

      }
    } else {
      console.log("Session não existe");
      contextInstance.createContext(sessionID);
      try {
        const media = MessageMedia.fromFilePath("./src/assets/fluenterp-logo.jpg");
        await chat.sendMessage(media);
      } catch (error) {
        console.log(error);        
      }
      await chat.sendMessage("Olá, eu sou a Jaspe, sua assistente virtual. Estou aqui para te ajudar.");
      await chat.sendMessage("Para começar, digite *!funcoes* para ver a lista de funções disponíveis.");
    }

  }
});

client.initialize();
