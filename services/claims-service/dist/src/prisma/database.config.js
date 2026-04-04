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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = getDatabaseUrl;
const dotenv = __importStar(require("dotenv"));
const fs_1 = require("fs");
const path_1 = require("path");
const envPaths = [
    (0, path_1.resolve)(process.cwd(), '.env'),
    (0, path_1.resolve)(process.cwd(), 'backend/.env'),
    (0, path_1.resolve)(__dirname, '../../.env'),
    (0, path_1.resolve)(__dirname, '../../../.env'),
];
let envLoaded = false;
for (const envPath of envPaths) {
    if (!(0, fs_1.existsSync)(envPath)) {
        continue;
    }
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
}
if (!envLoaded) {
    dotenv.config();
}
function getDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;
    if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
        throw new Error('DATABASE_URL no esta configurada. Crea backend/.env con la conexion a PostgreSQL antes de iniciar Prisma o ejecutar el seeder.');
    }
    return databaseUrl;
}
//# sourceMappingURL=database.config.js.map