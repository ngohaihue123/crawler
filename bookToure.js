const puppeteer = require('puppeteer');
const baseUrl = 'https://www.tripadvisor.com.vn'
const Excel = require('exceljs');
const _ = require('lodash');

const options = {
    filename: 'myfile2.xlsx',
    useStyles: true,
    useSharedStrings: true,
};

const workbook = new Excel.stream.xlsx.WorkbookWriter(options);

const worksheet = workbook.addWorksheet('data')

worksheet.columns = [
    { header: 'Username', key: 'username' },
    { header: 'User location', key: 'location' },
    { header: 'Comment content', key: 'content' }
]


async function getAllComment() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    })
    const page = await browser.newPage()
    await page.goto('https://www.tripadvisor.com.vn/Attraction_Review-g31352-d109676-Reviews-Tlaquepaque_Arts_Crafts_Village-Sedona_Arizona.html');
    let result = await page.evaluate(() => {
        let linkComments = [];
        document.querySelectorAll('[class="pageNumbers"] a').forEach(
            a => {
                linkComments.push(a.getAttribute('href'))
            });
        return linkComments;
    });
    result = result.filter(link => link != null && link != '');
    return result
}
async function getCommentDetail(link) {
    const linkFull = baseUrl + link;
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    })
    const page = await browser.newPage();
    await page.goto(linkFull);
    let result = await page.evaluate(() => {
        let comments = [];
        document.querySelectorAll('[class="review-container"]').forEach(a => {
            let comment = {}
            if (a.querySelector('.info_text div')) {
                comment.username = a.querySelector('.info_text div').textContent;
            } else comment.username = 'null';
            if (a.querySelector('.userLoc strong')) {
                comment.location = a.querySelector('.userLoc strong').textContent;
            } else comment.location = 'null';
            if (a.querySelector('.partial_entry')) {
                comment.content = a.querySelector('.partial_entry').textContent;
            } else comment.content = 'null'
            comments.push(comment);
            comment = {};
        });
        return comments;
    });
    browser.close();
    return result;
}

function writeData(data) {
    try {
        data.forEach(d => {
            worksheet.addRow(d).commit();
        });
        workbook.commit()
    } catch (error) {

    }


}

getAllComment().then(async (result) => {
    const arrayData = [];

    for (const link of result) {
        arrayData.push(await getCommentDetail(link));
    }

    const data = _.flatten(arrayData);
    writeData(data);
})

