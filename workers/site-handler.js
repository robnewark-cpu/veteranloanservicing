import { handleChatbotRequest } from "./chatbot.js";
import { handleDemoCalendar } from "./demo-calendar.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      return handleChatbotRequest(request, env, "/");
    }

    if (url.pathname === "/api/chat/lead") {
      return handleChatbotRequest(request, env, "/lead");
    }

    if (url.pathname.startsWith("/api/demo")) {
      return handleDemoCalendar(request, env, url.pathname);
    }

    return env.ASSETS.fetch(request);
  },
};
