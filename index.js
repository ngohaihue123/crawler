const puppeteer = require('puppeteer');
const _ = require('lodash');

const writeFile = require('./write-excel-file');

const LINK_FANPAGE = 'https://www.facebook.com/pg/hutong.hotpotparadise/posts';
const FILE_NAME = 'file3';
const HEIGTH_SCROLL = 100000;

async function autoScroll(page) {
    await page.evaluate(async () => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollTo(0, scrollHeight);

        const btnLuckhac = document.querySelector('#expanding_cta_close_button');
        if (btnLuckhac) {
            btnLuckhac.click();
        }

        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                console.log('SCROLL', totalHeight);
                if (totalHeight >= scrollHeight || totalHeight > 100000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    await new Promise(function (resolve) {
        setTimeout(resolve, 2000)
    });
}

async function getDetailPost(link, page) {
    await page.goto(link);
    await page.waitForResponse(response => response.ok());

    const result = await page.evaluate(async () => {
        const NAME_FANPAGE = 'Hutong';

        const listComment = [];
        const tagSpan = document.querySelectorAll('[data-testid="post_message"]')[0];
        const postDiv = document.querySelector('[data-testid="fbfeed_story"]');
        const _id = postDiv && postDiv.getAttribute('id').replace(/^.*_/g, '');

        let title = '';
        if (tagSpan) {
            const allParagraph = tagSpan.querySelectorAll('p');
            for (const p of allParagraph) {
                title += p.innerText;
            }
        }

        const rootComments = document.querySelectorAll('[data-testid="UFI2CommentsCount/root"]');
        const rootEleCmt = rootComments[rootComments.length - 1];
        if (rootEleCmt) {
            rootEleCmt.click();
        }

        await new Promise(function (resolve) {
            setTimeout(resolve, 2000)
        });

        const rootLink = document.querySelector('[data-testid="UFI2ViewOptionsSelector/link"]');
        if (rootLink) {
            rootLink.click();
        }

        await new Promise(function (resolve) {
            setTimeout(resolve, 2000)
        });

        const option = document.querySelector('[data-testid="UFI2ViewOptionsSelector/menuRoot"] li:nth-child(3)');
        if (option) {
            option.click();
        }

        await new Promise(function (resolve) {
            setTimeout(resolve, 5000)
        });

        function clickShowMore0() {
            const showMore = document.querySelector('[data-testid="UFI2CommentsPagerRenderer/pager_depth_0"]');
            if (showMore) {
                showMore.click();
            }
            return showMore;
        }

        function clickShowMore1() {
            const showMore = document.querySelector('[data-testid="UFI2CommentsPagerRenderer/pager_depth_1"]');
            if (showMore) {
                showMore.click();
            }
            return showMore;
        }

        let showMore0;
        let showMore1;
        let count = 0;
        do {
            showMore0 = clickShowMore0();
            console.error('SHOW MORE: ', showMore0);
            await new Promise(function (resolve) {
                setTimeout(resolve, 1000)
            });
        } while (showMore0 && count++ < 100);

        count = 0;
        do {
            showMore1 = clickShowMore1();
            console.error('SHOW MORE: ', showMore1);
            await new Promise(function (resolve) {
                setTimeout(resolve, 1000)
            });
        } while (showMore1 && count++ < 100);

        await new Promise(function (resolve) {
            setTimeout(resolve, 1000)
        });

        const commentDiv = document.querySelectorAll('[data-testid="UFI2Comment/root_depth_0"]');
        commentDiv.forEach(div => {
            let authorId;
            let author;
            const commentBody = div.querySelector('[data-testid="UFI2Comment/body"]');
            try {
                const linkTag = commentBody.querySelector('[data-hovercard]');
                authorId = linkTag.getAttribute('data-hovercard').replace('/ajax/hovercard/user.php?id=', '');
                authorId = authorId.replace(/\&extragetparams=.*/g, '');
                author = linkTag.innerText;
            } catch (error) {
                const spanUser = commentBody.querySelector('div>span');
                if (spanUser) {
                    author = spanUser.innerText;
                }
                console.log(error);
            }

            const timeTag = div.querySelector('[data-utime]');
            const publishedDate = timeTag && timeTag.getAttribute('data-utime');

            const reactionTag = div.querySelector('[data-testid="UFI2CommentTopReactions/tooltip"]>a>span:last-child');
            const likes = reactionTag && reactionTag.innerText;

            let content = '';
            const contentEle = div.querySelector('span[dir]>span>span');
            if (contentEle) {
                content = contentEle.innerText;
            }

            listComment.push({
                _id,
                title,
                authorId,
                author,
                content,
                publishedDate,
                likes,
                brand: NAME_FANPAGE
            });
        });

        return listComment;
    });

    return result;
}

async function getLinkPost(page) {
    let result = await page.evaluate(async () => {
        let linkPosts = [];

        document.querySelectorAll('[data-testid="UFI2CommentsCount/root"]').
            forEach(a => {
                linkPosts.push(a.getAttribute('href'));
            });
        linkPosts = linkPosts.filter(link => link.includes('post'));
        console.log(linkPosts);
        return linkPosts;
    });

    return result;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1351, height: 595 })
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto(LINK_FANPAGE);

    await autoScroll(page);

    let count = 0;
    while (count++ < 4) {
        await autoScroll(page);
        // await page.waitForResponse(response => response.ok());
    }

    let result = await getLinkPost(page);
    console.log(JSON.stringify(result));

    const data = [];
    for (const resultPage of result) {
        const detail = await getDetailPost(resultPage, page);
        data.push(detail);
    }

    await writeFile.run(FILE_NAME, data);
    await browser.close();
})();