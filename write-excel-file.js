const xlsx = require('node-xlsx');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');

exports.run = (fileName, data) => {
    const comments = _.flatten(data).map(comment => {
        return [
            comment._id,
            comment.title,
            comment.author,
            comment.authorId,
            comment.content,
            moment(parseInt(comment.publishedDate * 1000)).format('DD-MM-YYYY'),
            comment.brand,
            comment.likes,
        ];
    })

    const dataComment = [{
        name: 'Data',
        data: [
            ['_id', 'title', 'author', 'authorId', 'content', 'publishedDate', 'brand', 'likes'],
            ...comments
        ]
    }];

    const bufferResponse = xlsx.build(dataComment);

    fs.writeFile(`./${fileName}.xlsx`, bufferResponse, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}
