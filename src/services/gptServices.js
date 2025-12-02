const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

class gptServices {
  constructor() {
    this.openaiClient = axios.create({
      baseURL: "https://api.openai.com/v1/chat/completions",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    this.openaiClientImage = axios.create({
      baseURL: "https://api.openai.com/v1/images/generations",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    // this.contextClient = axios.create({})
  }

  async getContext() {
    const jsonString = fs.readFileSync("./db/db.json");
    const context = JSON.parse(jsonString);
    return context;
  }

  async setContext(oldContext, content) {
    const context = {
      messages: [...oldContext.messages, content],
    };

    const json = JSON.stringify(context);
    fs.writeFileSync("./db/db.json", json);
  }

  curarIA({ initCallBack, successCallBack }) {
    const obj = {
      messages: []
    };

    initCallBack();
    const json = JSON.stringify(obj);

    fs.writeFileSync("./db/db.json", json);
    successCallBack();
  }

  async chatIA(message, { successCallBack, errorCallback }) {
    try {
      const oldContext = await this.getContext();

      const content = {
        role: "user",
        content: message,
      };

      const response = await this.openaiClient.post("", {
        model: "gpt-3.5-turbo",
        messages: [...oldContext.messages, content],
        temperature: 0.2,
      });

      await this.setContext(oldContext, content);

      await this.setContext(
        {
          messages: [...oldContext.messages, content],
        },
        response.data.choices[0].message
      );

      successCallBack(response.data.choices[0].message.content);
    } catch (error) {
      errorCallback();
      console.error(error);
    }
  }

  async gerarImageIA(message, { initCallBack, successCallBack, errorCallback }) {
    try {
      initCallBack();

      const response = await this.openaiClientImage.post("", {
        prompt: message,
        n: 1,
        size: "512x512",
        response_format: "b64_json",
      });

      successCallBack(response.data.data[0].b64_json);
    } catch (error) {
      errorCallback();
      console.error(error);
    }
  }
}

module.exports = gptServices;
