const fs = require('fs');

class ContextServices {
  constructor() {}

  isContextExist(userId) {
    return fs.existsSync(`./src/contexts/${userId}.json`);
  }

  createContext(userId) {
    console.log("Criando contexto");
    const context = {
      messages: [],
    };

    const json = JSON.stringify(context);
    fs.writeFileSync(`./src/contexts/${userId}.json`, json);
  }
}

module.exports = ContextServices;