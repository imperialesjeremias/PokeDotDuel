"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPE_EFFECTIVENESS = exports.TransactionSchema = exports.PackSchema = exports.BidSchema = exports.AuctionSchema = exports.ListingSchema = exports.BattleSchema = exports.LobbySchema = exports.TeamSchema = exports.UserSchema = exports.CardSchema = exports.StatsSchema = exports.TypeGen1Schema = exports.RaritySchema = void 0;
exports.calculateTypeEffectiveness = calculateTypeEffectiveness;
exports.getTypeColor = getTypeColor;
exports.getRarityColor = getRarityColor;
const zod_1 = require("zod");
// Zod schemas
exports.RaritySchema = zod_1.z.enum(['COMMON', 'RARE', 'LEGENDARY']);
exports.TypeGen1Schema = zod_1.z.enum([
    'NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE',
    'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC',
    'BUG', 'ROCK', 'GHOST', 'DRAGON'
]);
exports.StatsSchema = zod_1.z.object({
    hp: zod_1.z.number().min(0),
    atk: zod_1.z.number().min(0),
    def: zod_1.z.number().min(0),
    spa: zod_1.z.number().min(0),
    spd: zod_1.z.number().min(0),
    spe: zod_1.z.number().min(0),
});
exports.CardSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    dexNumber: zod_1.z.number().min(1).max(151),
    name: zod_1.z.string(),
    isShiny: zod_1.z.boolean(),
    rarity: exports.RaritySchema,
    level: zod_1.z.number().min(1).max(100),
    stats: exports.StatsSchema,
    types: zod_1.z.array(exports.TypeGen1Schema),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    walletAddress: zod_1.z.string(),
    username: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    level: zod_1.z.number().min(1),
    xp: zod_1.z.number().min(0),
    badges: zod_1.z.array(zod_1.z.any()),
    pokecoins: zod_1.z.number().min(0),
    stats: zod_1.z.object({
        wins: zod_1.z.number().min(0),
        losses: zod_1.z.number().min(0),
        packsOpened: zod_1.z.number().min(0),
        cardsOwned: zod_1.z.number().min(0),
        totalWagered: zod_1.z.number().min(0),
        totalWon: zod_1.z.number().min(0),
    }),
});
exports.TeamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    slots: zod_1.z.array(zod_1.z.string().uuid()).length(6),
    natures: zod_1.z.array(zod_1.z.string()),
    moves: zod_1.z.record(zod_1.z.array(zod_1.z.string())),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.LobbySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    bracketId: zod_1.z.number(),
    creatorId: zod_1.z.string().uuid(),
    opponentId: zod_1.z.string().uuid().optional(),
    inviteCode: zod_1.z.string().optional(),
    status: zod_1.z.enum(['OPEN', 'FULL', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']),
    escrowPda: zod_1.z.string().optional(),
    wagerLamports: zod_1.z.number().min(0),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.BattleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    lobbyId: zod_1.z.string().uuid(),
    playerA: zod_1.z.string().uuid(),
    playerB: zod_1.z.string().uuid(),
    result: zod_1.z.object({
        winner: zod_1.z.string().uuid(),
        reason: zod_1.z.enum(['KO', 'Timeout', 'Forfeit']),
    }).optional(),
    transcript: zod_1.z.array(zod_1.z.any()).optional(),
    startedAt: zod_1.z.string().datetime().optional(),
    endedAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
});
exports.ListingSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    cardId: zod_1.z.string().uuid(),
    sellerId: zod_1.z.string().uuid(),
    priceLamports: zod_1.z.number().min(0),
    status: zod_1.z.enum(['ACTIVE', 'SOLD', 'CANCELLED']),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.AuctionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    cardId: zod_1.z.string().uuid(),
    sellerId: zod_1.z.string().uuid(),
    reservePriceLamports: zod_1.z.number().min(0),
    endAt: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['ACTIVE', 'ENDED', 'CANCELLED']),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.BidSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    auctionId: zod_1.z.string().uuid(),
    bidderId: zod_1.z.string().uuid(),
    amountLamports: zod_1.z.number().min(0),
    createdAt: zod_1.z.string().datetime(),
});
exports.PackSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    buyerId: zod_1.z.string().uuid(),
    paymentSig: zod_1.z.string().optional(),
    vrfRequestId: zod_1.z.string().optional(),
    opened: zod_1.z.boolean(),
    openedAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
});
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid().optional(),
    kind: zod_1.z.enum([
        'DEPOSIT_SOL', 'WITHDRAW_SOL', 'BUY_POKECOINS', 'SELL_CARD',
        'BUY_CARD', 'BID', 'WAGER_DEPOSIT', 'WAGER_PAYOUT',
        'PACK_PURCHASE', 'PACK_REWARD'
    ]),
    solLamports: zod_1.z.number().min(0),
    pokecoinsDelta: zod_1.z.number(),
    refId: zod_1.z.string().uuid().optional(),
    onchainSig: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()),
    createdAt: zod_1.z.string().datetime(),
});
// Type effectiveness chart (Gen 1)
exports.TYPE_EFFECTIVENESS = {
    NORMAL: {
        NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
        FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
        BUG: 1, ROCK: 0.5, GHOST: 0, DRAGON: 1
    },
    FIRE: {
        NORMAL: 1, FIRE: 0.5, WATER: 0.5, ELECTRIC: 1, GRASS: 2, ICE: 2,
        FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
        BUG: 2, ROCK: 0.5, GHOST: 1, DRAGON: 0.5
    },
    WATER: {
        NORMAL: 1, FIRE: 2, WATER: 0.5, ELECTRIC: 1, GRASS: 0.5, ICE: 1,
        FIGHTING: 1, POISON: 1, GROUND: 2, FLYING: 1, PSYCHIC: 1,
        BUG: 1, ROCK: 2, GHOST: 1, DRAGON: 0.5
    },
    ELECTRIC: {
        NORMAL: 1, FIRE: 1, WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, ICE: 1,
        FIGHTING: 1, POISON: 1, GROUND: 0, FLYING: 2, PSYCHIC: 1,
        BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 0.5
    },
    GRASS: {
        NORMAL: 1, FIRE: 0.5, WATER: 2, ELECTRIC: 1, GRASS: 0.5, ICE: 1,
        FIGHTING: 1, POISON: 0.5, GROUND: 2, FLYING: 0.5, PSYCHIC: 1,
        BUG: 0.5, ROCK: 2, GHOST: 1, DRAGON: 0.5
    },
    ICE: {
        NORMAL: 1, FIRE: 0.5, WATER: 0.5, ELECTRIC: 1, GRASS: 2, ICE: 0.5,
        FIGHTING: 1, POISON: 1, GROUND: 2, FLYING: 2, PSYCHIC: 1,
        BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 2
    },
    FIGHTING: {
        NORMAL: 2, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 2,
        FIGHTING: 1, POISON: 0.5, GROUND: 1, FLYING: 0.5, PSYCHIC: 0.5,
        BUG: 0.5, ROCK: 2, GHOST: 0, DRAGON: 1
    },
    POISON: {
        NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 2, ICE: 1,
        FIGHTING: 1, POISON: 0.5, GROUND: 0.5, FLYING: 1, PSYCHIC: 1,
        BUG: 2, ROCK: 0.5, GHOST: 0.5, DRAGON: 1
    },
    GROUND: {
        NORMAL: 1, FIRE: 2, WATER: 1, ELECTRIC: 2, GRASS: 0.5, ICE: 1,
        FIGHTING: 1, POISON: 2, GROUND: 1, FLYING: 0, PSYCHIC: 1,
        BUG: 0.5, ROCK: 2, GHOST: 1, DRAGON: 1
    },
    FLYING: {
        NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 0.5, GRASS: 2, ICE: 1,
        FIGHTING: 2, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
        BUG: 2, ROCK: 0.5, GHOST: 1, DRAGON: 1
    },
    PSYCHIC: {
        NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
        FIGHTING: 2, POISON: 2, GROUND: 1, FLYING: 1, PSYCHIC: 0.5,
        BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 1
    },
    BUG: {
        NORMAL: 1, FIRE: 0.5, WATER: 1, ELECTRIC: 1, GRASS: 2, ICE: 1,
        FIGHTING: 0.5, POISON: 2, GROUND: 1, FLYING: 0.5, PSYCHIC: 2,
        BUG: 1, ROCK: 1, GHOST: 0.5, DRAGON: 1
    },
    ROCK: {
        NORMAL: 1, FIRE: 2, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 2,
        FIGHTING: 0.5, POISON: 1, GROUND: 0.5, FLYING: 2, PSYCHIC: 1,
        BUG: 2, ROCK: 1, GHOST: 1, DRAGON: 1
    },
    GHOST: {
        NORMAL: 0, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
        FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 0,
        BUG: 1, ROCK: 1, GHOST: 2, DRAGON: 1
    },
    DRAGON: {
        NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
        FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
        BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 2
    }
};
// Utility functions
function calculateTypeEffectiveness(attackType, targetTypes) {
    let effectiveness = 1;
    for (const targetType of targetTypes) {
        effectiveness *= exports.TYPE_EFFECTIVENESS[attackType][targetType];
    }
    return effectiveness;
}
function getTypeColor(type) {
    const colors = {
        NORMAL: '#A8A878',
        FIRE: '#F08030',
        WATER: '#6890F0',
        ELECTRIC: '#F8D030',
        GRASS: '#78C850',
        ICE: '#98D8D8',
        FIGHTING: '#C03028',
        POISON: '#A040A0',
        GROUND: '#E0C068',
        FLYING: '#A890F0',
        PSYCHIC: '#F85888',
        BUG: '#A8B820',
        ROCK: '#B8A038',
        GHOST: '#705898',
        DRAGON: '#7038F8',
    };
    return colors[type];
}
function getRarityColor(rarity) {
    const colors = {
        COMMON: '#9CA3AF',
        RARE: '#3B82F6',
        LEGENDARY: '#F59E0B',
    };
    return colors[rarity];
}
