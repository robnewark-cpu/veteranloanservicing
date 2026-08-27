import { handleChatbotRequest } from "./chatbot.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      return handleChatbotRequest(request, env, "/");
    }

    if (url.pathname === "/api/chat/lead") {
      return handleChatbotRequest(request, env, "/lead");
    }

    return env.ASSETS.fetch(request);
  },
};
