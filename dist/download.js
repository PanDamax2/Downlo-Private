"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadMovie = void 0;
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const progress_1 = __importDefault(require("progress"));
const stream_1 = __importDefault(require("stream"));
const util_1 = require("util");
const pipeline = (0, util_1.promisify)(stream_1.default.pipeline);
const downloadMovie = (fileUrl, videoTitle) => {
    if (!fileUrl) {
        console.error('Podaj URL pliku jako argument.');
        process.exit(1);
    }
    const outputDir = path_1.default.resolve(__dirname, 'movie');
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    const destination = path_1.default.join(outputDir, `${videoTitle}.mp4`);
    const file = fs_1.default.createWriteStream(destination);
    console.log(`\nRozpoczynanie pobierania: ${videoTitle}`);
    https_1.default.get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Download failed. Status Code: ${response.statusCode}`);
            return;
        }
        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        const progressBar = new progress_1.default('[:bar] :percent :etas', {
            width: 40,
            total: totalSize,
        });
        response.on('data', (chunk) => {
            progressBar.tick(chunk.length);
        });
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => {
                console.log('\nPlik został pobrany pomyślnie');
            });
        });
    }).on('error', (err) => {
        fs_1.default.unlink(destination, () => {
            console.error('Błąd podczas pobierania pliku:', err);
        });
    });
};
exports.downloadMovie = downloadMovie;
