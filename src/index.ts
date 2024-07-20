import puppeteer from 'puppeteer';
import { downloadMovie } from './download';

const url = process.argv[2];
let videoTitle = '';

if (!url) {
    console.error('Podaj URL strony jako argument.');
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let mediaUrls: string[] = [];
    
    console.log('Szukam filmu...');
    
    await page.goto(url);

    await page.waitForSelector('.fc-button.fc-cta-consent.fc-primary-button');
    await page.click('.fc-button.fc-cta-consent.fc-primary-button');

    videoTitle = await page.evaluate(() => {
        const titleElement = document.querySelector('.title-name h1');
        const title = titleElement ? (titleElement as HTMLElement).innerText : 'Nie znaleziono tytułu';


        const parentElement = document.querySelector('.brndPlayerPd');
        const div = parentElement ? parentElement.firstElementChild : null;
        if (div) {
            let playerData = div.getAttribute('player_data');
            if (playerData) {
                playerData = playerData.replace(/"adOnPauseEnabled":true/g, '"adOnPauseEnabled":false');
                playerData = playerData.replace(/"adOnPauseElement":".*?"/g, '"adOnPauseElement":""');
                playerData = playerData.replace(/"autoplay":false/g, '"autoplay":true');

                div.setAttribute('player_data', playerData);
            } else {
                console.error('Atrybut player_data nie został znaleziony.');
            }
        } else {
            console.error('Nie znaleziono diva ' + parentElement);
        }
        return title;
    });

    await page.waitForSelector('.pb-settings-click');
    await page.click('.pb-settings-click');

    page.on('request', (request) => {
        if (request.resourceType() === 'media') {
            mediaUrls.push(request.url());
        }
    });

    await page.waitForSelector('li[data-value="hd"]');
    await page.click('li[data-value="hd"]');

    await new Promise<void>(resolve => {
        const checkRequests = () => {
            if (mediaUrls.length > 0) {
                resolve();
            } else {
                setTimeout(checkRequests, 100);
            }
        };
        checkRequests();
    });

    const filteredUrl = mediaUrls.filter(url => url.startsWith('https://vwaw'));
    console.log('Znaleziono film: ', videoTitle);

    downloadMovie(filteredUrl[filteredUrl.length - 1], videoTitle);

    await browser.close();
})();
