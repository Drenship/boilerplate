import { createClient, RedisClientType } from "redis";

// Configurer les variables d'environnement
const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PORT = process.env.REDIS_PORT!;
const REDIS_PASS = process.env.REDIS_PASS!;

// Créer une instance unique du client Redis
const redisClient: RedisClientType = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
  password: REDIS_PASS,
});

// Gérer les événements Redis
redisClient.on("error", (err) => console.error("Erreur Redis :", err));
//redisClient.on("connect", () => console.log("Connexion à Redis établie."));
//redisClient.on("ready", () => console.log("Redis prêt à être utilisé."));

// Connexion unique
if (!redisClient.isOpen) {
  redisClient.connect().catch((err) => console.error("Erreur lors de la connexion Redis :", err));
}

export default redisClient;