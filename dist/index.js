"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const download_1 = require("./download");
const url = process.argv[2];
let videoTitle = '';
if (!url) {
    console.error('Podaj URL strony jako argument.');
    process.exit(1);
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    let mediaUrls = [];
    console.log('Szukam filmu...');
    yield page.goto(url);
    yield page.waitForSelector('.fc-button.fc-cta-consent.fc-primary-button');
    yield page.click('.fc-button.fc-cta-consent.fc-primary-button');
    videoTitle = yield page.evaluate(() => {
        const titleElement = document.querySelector('.title-name h1');
        const title = titleElement ? titleElement.innerText : 'Nie znaleziono tytułu';
        const parentElement = document.querySelector('.brndPlayerPd');
        const div = parentElement ? parentElement.firstElementChild : null;
        if (div) {
            let playerData = div.getAttribute('player_data');
            if (playerData) {
                playerData = playerData.replace(/"adOnPauseEnabled":true/g, '"adOnPauseEnabled":false');
                playerData = playerData.replace(/"adOnPauseElement":".*?"/g, '"adOnPauseElement":""');
                playerData = playerData.replace(/"autoplay":false/g, '"autoplay":true');
                div.setAttribute('player_data', playerData);
            }
            else {
                console.error('Atrybut player_data nie został znaleziony.');
            }
        }
        else {
            console.error('Nie znaleziono diva ' + parentElement);
        }
        return title;
    });
    yield page.waitForSelector('.pb-settings-click');
    yield page.click('.pb-settings-click');
    page.on('request', (request) => {
        if (request.resourceType() === 'media') {
            mediaUrls.push(request.url());
        }
    });
    yield page.waitForSelector('li[data-value="hd"]');
    yield page.click('li[data-value="hd"]');
    yield new Promise(resolve => {
        const checkRequests = () => {
            if (mediaUrls.length > 0) {
                resolve();
            }
            else {
                setTimeout(checkRequests, 100);
            }
        };
        checkRequests();
    });
    const filteredUrl = mediaUrls.filter(url => url.startsWith('https://vwaw'));
    console.log('Znaleziono film: ', videoTitle);
    (0, download_1.downloadMovie)(filteredUrl[filteredUrl.length - 1], videoTitle);
    yield browser.close();
}))();
