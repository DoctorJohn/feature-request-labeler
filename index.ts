import { LabelerServer } from "@skyware/labeler";
import { Bot, Post } from "@skyware/bot";
import postsData from "./posts.json";

const POSTS: {
  delete: string;
  labels: Record<string, string>;
} = postsData;

const LABELS = Object.values(POSTS.labels);

const server = new LabelerServer({
  did: process.env.LABELER_DID,
  signingKey: process.env.LABELER_KEY,
  dbPath: "./data/labels.db",
});

server.start(14831, (error) => {
  if (error) {
    console.error("Failed to start server", error);
  } else {
    console.log("Server started on port 14831");
  }
});

const bot = new Bot();

await bot.login({
  identifier: process.env.LABELER_DID,
  password: process.env.LABELER_PWD,
});

bot.on("like", async (like) => {
  if (like.subject instanceof Post) {
    console.log("LIKED", like.user.displayName, like.subject.uri);

    const label = POSTS.labels[like.subject.uri];

    if (label) {
      await like.user.labelAccount([label]);
    } else if (like.subject.uri === POSTS.delete) {
      await like.user.labelAccount(LABELS);
    }
  }
});
