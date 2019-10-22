const puppeteer = require('puppeteer');
let browser;
async function getAllPost() {
    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
    const page = await browser.newPage()
    await page.goto('https://www.facebook.com/pg/hutong.hotpotparadise/posts/');
    let result = await page.evaluate(() => {
        let linkPosts = [];
        document.querySelectorAll('[data-testid="UFI2CommentsCount/root"]').
            forEach(a => {
                linkPosts.push(a.getAttribute('href'));
            });
        linkPosts = linkPosts.filter(link => link.includes('post'));
        return linkPosts;
    });
    // browser.close();
    return result
}

async function getDetailPost(link) {
    const page = await browser.newPage();
    await page.goto(link);
    let result = await page.evaluate(() => {
        let tagSpan = document.querySelector('[data-testid="UFI2CommentsCount/root"]').parentNode;
        return tagSpan;
    });
    await page.click(result);
    return result;
}

getAllPost().then(async result => {
    // console.log(result)
    // // result.forEach(link => {
    // //     getDetailPost(link);
    // // })
    let detail = await getDetailPost(result[1]);
    console.log(detail);
})
