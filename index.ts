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

server.start({ host: "0.0.0.0", port: 14831 }, (error, address) => {
  if (error) {
    console.error("Failed to start server", error);
  } else {
    console.log("Server started on", address);
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
      try {
        await like.user.labelAccount([label]);
      } catch (error) {
        console.error("Failed to label account", error);
      }
    } else if (like.subject.uri === POSTS.delete) {
      try {
        await like.user.negateAccountLabels(LABELS);
      } catch (error) {
        console.error("Failed to negate account labels", error);
      }
    }
  }
});
