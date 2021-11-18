const http = require('http');
const https = require('https');

exports.get = async (req, resp, next) => {

    let errorMessage = "Erro ao coletar os dados.";
    let isValid = false;
    let account = req.params.account;

    dataImages = await getPhotos(account);
    
    if (dataImages !== null && dataImages !== undefined && dataImages !== [] && dataImages.length > 0) {
        errorMessage = '';
        isValid = true;
    }

    // let dataImages = [];

    // var options = {
    //     hostname: 'localhost',
    //     port: 8080,
    //     path: '/tatuadores/conexao/instagram',
    //     method: 'GET', // <--- aqui podes escolher o método
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //     }
    // };

    // var req = http.request(options, (res) => {
    //     res.setEncoding('utf8');
    //     let usersActiveAccount = [];
    //     res.on('data', d => usersActiveAccount = JSON.parse(d));
    //     res.on('end', async () => {
    //         // console.log(usersActiveAccount.reverse());
    //         dataImages = await getPhotos(usersActiveAccount);
    //         console.log(dataImages);
    //     });
    // });

    // req.on('error', (e) => {
    //     console.log(`Houve um erro: ${e.message}`);
    // });

    // // aqui podes enviar data no POST
    // // req.write(postData);
    // req.end();

    //envia resposta
    resp.send({
        "ErrorMessage": errorMessage,
        "IsValid": isValid,
        "Data": dataImages
    });
};

async function getPhotos(account) {

    let instagramAccount = {
        username: 'ink4YouApi',
        password: 'KatchupRaines'
    }

    // let usersImages = [];

    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    await page.goto('https://www.instagram.com/');

    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', instagramAccount.username);
    await page.type('input[name="password"]', instagramAccount.password);

    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);

    await page.close();
    page = await browser.newPage();

    await page.goto(`https://www.instagram.com/${account}/`);

    await page.waitForSelector('article');

    await autoScroll(page);

    let imgList = await page.evaluate(() => {
        // funcao executada no browser

        let imgs = [];

        //pegar as imagens
        const nodeList = document.querySelectorAll('article img');
        // passar nodeList para array
        const imgArray = [...nodeList];

        //transformar os elementos em objetos js
        const list = imgArray.map(({ src }) => ({
            src
        }));

        for (let i = 0; i < list.length; i++) {
            imgs.push(list[i].src);
        }

        let btn = document.querySelector('span._2dbep.qNELH');
        btn.click();

        let logout = document.querySelectorAll('div.-qQT3')[1];
        logout.click();

        return imgs;
    });

    // await page.waitForSelector('span._2dbep.qNELH');
    // await page.click('span._2dbep.qNELH');

    // for (let i = 0; i < usersActiveAccount.length; i++) {
    //     let account = usersActiveAccount[i];

    //     usersImages.push({
    //         user: account,
    //         images: imgList
    //     });

    // }

    // if (usersImages != null && usersImages != undefined && usersImages.length > 0) {
    //     errorMessage = '';
    //     isValid = true;
    // }

    //fechar navegador
    await browser.close();

    return imgList;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

