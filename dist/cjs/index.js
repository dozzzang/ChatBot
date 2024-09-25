"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rkPluginLog = exports.readyLog = void 0;
__exportStar(require("./server"), exports);
__exportStar(require("./message"), exports);
__exportStar(require("./plugin"), exports);
__exportStar(require("./types"), exports);
var logger_1 = require("./logger");
Object.defineProperty(exports, "readyLog", { enumerable: true, get: function () { return logger_1.readyLog; } });
Object.defineProperty(exports, "rkPluginLog", { enumerable: true, get: function () { return logger_1.rkPluginLog; } });
const core_1 = require("@remote-kakao/core");
const prefix = ">";
const server = new core_1.UDPServer({ serviceName: "Example Service" });
server.on("message", async (msg) => {
    if (!msg.content.startsWith(prefix))
        return;
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
