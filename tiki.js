const puppeteer = require('puppeteer');
const baseUrl = 'https://www.tripadvisor.com.vn'
const Excel = require('exceljs');

const options = {
    filename: 'myfile.xlsx',
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
    await page.goto('https://tiki.vn/smart-tivi-samsung-49-inch-uhd-4k-ua49nu7100kxxv-hang-chinh-hang-p2082785.html?src=category-page-4221.5015&2hi=0&_lc=Vk4wMjUwMDMwMDg%3D');
    let result = await page.evaluate(async () => {
        window.scrollBy(0, 3000)

        let listPager = document.querySelectorAll('[class="list-pager"] ul li');
        return listPager;
    });
    return result
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
    console.log(result);
    // let data = [];
    // let promise = [];
    // result.forEach(link => {
    //     promise.push(getCommentDetail(link));
    // });
    // let arrayData = await Promise.all(promise);
    // arrayData.forEach(a => {
    //     data = data.concat(a);
    // });
    // writeData(data);
    // console.log(data);

})

