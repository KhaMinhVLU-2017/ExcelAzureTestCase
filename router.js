var express = require('express')
var router = express.Router()
const xmlToJson = require('xml-to-json-stream')
const parserXml = xmlToJson({ attributeMode: false })
const stripHtml = require("string-strip-html")
require('core-js/modules/es.promise');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('regenerator-runtime/runtime');
const ExcelJS = require('exceljs/dist/es5')

router.get('/json', (req, res) => {
    //Todo write Excel
    let pathFile = './Excels/query.csv'
    let options = {
        filename: pathFile,
        useStyles: true,
        useSharedStrings: true
    }
    let workbook = new ExcelJS.Workbook()
    let listContrucExcel = []
    //Read
    workbook.csv.readFile(pathFile)
        .then(worksheet => {
            worksheet.eachRow(function (row, rowNumber) {
                if (rowNumber !== 1) {
                    let recore = {}
                    //console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                    row.eachCell(function (cell, colNumber) {
                        if (colNumber === 1) {
                            recore.state = cell.value
                        }
                        if (colNumber === 2) {
                            recore.id = cell.value
                        }
                        if (colNumber === 3) {
                            recore.workItem = cell.value
                        }
                        if (colNumber === 4) {
                            recore.title = cell.value
                        }
                        if (colNumber === 5) {
                            let { value } = cell
                            //console.log(rowNumber, colNumber)
                            parserXml.xmlToJson(value, (err, data) => {
                                value
                                let { step } = data.steps
                                let ListStep = []
                                for (let keyIndex in step) {
                                    let action = step[keyIndex].parameterizedString[0]
                                    let expectedResult = step[keyIndex].parameterizedString[1]
                                    let jsonStep = {
                                        testCase: rowNumber,
                                        step: keyIndex,
                                        action: stripHtml(action),
                                        expectedResult: stripHtml(expectedResult)
                                    }
                                    //workbookStream.getCell(`E${rowNumber}`).value = jsonStep
                                    //console.log(jsonStep)
                                    ListStep.push(jsonStep)
                                }
                                recore["steps"] = ListStep
                            })
                            //console.log('Cell ' + colNumber + ' = ' + cell.value);
                        }
                    });

                    listContrucExcel.push(recore)
                }
            })
        })
        .then(async result => {
            //Write
            let pathFileNew = './Excels/result.csv'
            let workbookNew = new ExcelJS.Workbook()
            let workSheetNew = workbookNew.addWorksheet('MeoooMeooo')
            let columnHeader = [
                { header: 'State', key: 'state', width: 15 },
                { header: 'Id', key: 'id', width: 10 },
                { header: 'Work Item Type', key: 'workitem', width: 20 },
                { header: 'Title', key: 'title', width: 40 },
                { header: 'Step', key: 'step', width: 40 },
            ]
            workSheetNew.columns = columnHeader

            let rows = []

            for (let item of listContrucExcel) {
                let row = [item.state, item.id, item.workItem, item.title]
                let step = item.steps.map(step => {
                    let des = `Step ${parseInt(step.step) + 1}:             Action-${step.action}                 ExpectedResult-${step.expectedResult}`
                    return des
                })
                row.push(step.join('\n'))
                rows.push(row)
            }
            workSheetNew.addRows(rows)

            await workbookNew.csv.writeFile(pathFileNew);

            console.log('Starting...')
            res.json(listContrucExcel)
        })
})

let jsonPareStream = {
    "Step": 0,
    "Action": "s",
    "Expected Result": "result"
}

module.exports = router