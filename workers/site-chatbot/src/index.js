/**
 * Standalone deployment for the shared multi-site chatbot worker.
 * Deploy with: npm run deploy:chatbot
 *
 * Replaces https://site-chatbots.robert-bb6.workers.dev after deploy + secret setup.
 */
import { handleChatbotRequest } from "../../chatbot.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/lead" ? "/lead" : "/";
    return handleChatbotRequest(request, env, pathname);
  },
};
