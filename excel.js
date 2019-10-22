
const Excel = require('exceljs');

const options = {
    filename: 'myfile1.xlsx',
    useStyles: true,
    useSharedStrings: true
};

const workbook = new Excel.stream.xlsx.WorkbookWriter(options);

const worksheet = workbook.addWorksheet('my sheet');

worksheet.columns = [
    { header: 'Id', key: 'id' },
    { header: 'First Name', key: 'first name' },
    { header: 'Phone', key: 'ph' }
]

var data;

for (let i = 1; i <= 10; i++) {

    data = {
        id: i,
        'first name': "name " + i,
        ph: "012014520" + i
    };

    worksheet.addRow(data).commit();
}

workbook.commit().then(function () {
    console.log('excel file cretaed');
});