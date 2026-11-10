// "Is this a request to an assistant?" from the transcript: nearest examples in a pretrained sentence-embedding space.
// Hard negatives are deliberate: questions to people, and TV/video narration.

const REQUESTS = [
  "set a timer for ten minutes", "what's the weather tomorrow", "play some music", "turn off the lights",
  "what time is it", "remind me to call mom at five", "how tall is mount everest", "send a message to alex",
  "call dad", "what's on my calendar today", "turn up the volume", "navigate to the nearest gas station",
  "how do you say thank you in spanish", "add milk to my shopping list", "wake me up at seven tomorrow",
  "what's fifteen times twelve", "who won the game last night", "open youtube", "take a note", "tell me a joke",
  "what's the capital of australia", "skip this song", "how many calories are in an apple", "text sarah I'm running late",
  "hey google what's your favorite movie", "are you listening to me", "can you help me with something", "give me a recipe for pancakes",
  "I'm asking you, how far away is the moon", "do you know any good restaurants nearby", "answer my question", "find me a flight to boston",
];
const CHAT = [
  "yeah I'll be there in like ten minutes", "did you see what happened at work", "I don't know, what do you think",
  "that's so funny", "okay sounds good see you later", "honestly I'm really tired today", "no I told him already",
  "we should get dinner sometime", "and then she just left", "wait really? that's crazy", "I'm gonna grab a coffee",
  "mm-hmm yeah", "can you pass me that", "how was your weekend", "I think the meeting got moved", "thanks so much, bye",
  "and in today's video we're going to look at", "welcome back to the channel", "the president said on tuesday that",
  "so basically what happened was", "don't forget to like and subscribe", "are you coming to the party", "hold on one sec",
  "I'm just working on this thing right now", "it's been a really long week", "I was thinking we could try something else",
  "my boss wants it done by friday", "anyway I'll tell you more later", "it's going pretty well actually", "um yeah so",
];

async function makeIntent(pipeline) {
  const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { dtype: "q8" });
  const vec = async texts => (await embed(texts, { pooling: "mean", normalize: true })).tolist();
  const [R, C] = [await vec(REQUESTS), await vec(CHAT)];
  const top3 = (v, M) => M.map(m => m.reduce((s, x, i) => s + x * v[i], 0)).sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b) / 3;
  return async text => {
    if (!text.trim()) return { score: -1 };
    const [v] = await vec([text.toLowerCase()]);
    return { score: top3(v, R) - top3(v, C) };  // > 0: closer to requests than to chat
  };
}

if (typeof module !== "undefined") module.exports = { makeIntent, REQUESTS, CHAT };
