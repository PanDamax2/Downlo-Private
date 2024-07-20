import https from 'https';
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

export const downloadMovie = (fileUrl: string, videoTitle: string): void => {
    if (!fileUrl) {
        console.error('Podaj URL pliku jako argument.');
        process.exit(1);
    }

    const outputDir = path.resolve(__dirname, 'movie');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const destination = path.join(outputDir, `${videoTitle}.mp4`);
    const file = fs.createWriteStream(destination);

    console.log(`\nRozpoczynanie pobierania: ${videoTitle}`);

    https.get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Download failed. Status Code: ${response.statusCode}`);
            return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        const progressBar = new ProgressBar('[:bar] :percent :etas', {
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
        fs.unlink(destination, () => {
            console.error('Błąd podczas pobierania pliku:', err);
        });
    });
};
