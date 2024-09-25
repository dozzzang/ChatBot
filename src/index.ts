export * from "./server";
export * from "./message";
export * from "./plugin";
export * from "./types";
export { readyLog, rkPluginLog } from "./logger";
import { UDPServer } from "@remote-kakao/core";

const prefix = ">";
const server = new UDPServer({ serviceName: "Example Service" });

server.on("message", async (msg) => {
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(" ");
  const cmd = args.shift()?.slice(prefix.length);

  if (cmd === "ping") {
    /*
      this command's result is the ping between Node.js and MessengerBot,
      not between MessengerBot and the KakaoTalk server.
    */
    const timestamp = Date.now();
    await msg.replyText("Pong!");
    msg.replyText(`${Date.now() - timestamp}ms`);
  }
});

server.start();
