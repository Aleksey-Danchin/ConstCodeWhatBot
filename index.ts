import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);
const data = JSON.parse(readFileSync("./data.json", "utf-8"));
const chatIds: Array<number> = data.chatIds || [];

bot.use(async (ctx, next) => {
	const chatId = ctx?.chat?.id as number;

	if (chatId && !chatIds.includes(chatId)) {
		chatIds.push(chatId);

		await writeFile("./data.json", JSON.stringify({ chatIds }, null, 2));
	}

	next();
});

bot.on("text", (ctx, next) => {
	console.log(ctx.message.from.first_name, ctx.message.from.last_name);
	console.log(ctx.message.text);
	console.log("\n");

	next();
});

bot.start((ctx) => {
	console.log(ctx.message.from.first_name, ctx.message.from.last_name);
	console.log(ctx.message.text);
	console.log("\n");

	ctx.reply("Welcome");
});

bot.command("all", (ctx) => {
	const message = ctx.message.text.slice(5);

	if (message) {
		for (const chatId of chatIds) {
			bot.telegram.sendMessage(
				chatId,
				`${ctx.message.from.first_name} ${ctx.message.from.last_name}\n${message}`
			);
		}
	}
});

bot.launch()
	.then(() => {
		console.log("Mr. ConstCode What Bot fired!");
		console.log("chatIds", chatIds);
	})
	.then(() => {
		bot.telegram.sendMessage(446374743, "Mr. ConstCode What Bot actived!");
	});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
