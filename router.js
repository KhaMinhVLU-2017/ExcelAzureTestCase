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
    let headerTitle = []
    //Read
    workbook.csv.readFile(pathFile)
        .then(worksheet => {
            worksheet.eachRow(function (row, rowNumber) {
                if (rowNumber === 1) {
                    row.eachCell((cell, colNumber) => {
                        let keyPrimite = cell.value.split(' ').join('-')
                        headerTitle.push(keyPrimite)
                    })
                }
                else if (rowNumber !== 1) {
                    let recore = {}
                    //console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                    row.eachCell(function (cell, colNumber) {
                        let keyRecore = headerTitle[colNumber - 1]
                        if (keyRecore !== 'Steps') {
                            recore[keyRecore] = cell.value
                        } else {
                            let { value } = cell
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
                                recore[keyRecore] = ListStep
                            })
                        }

                    })
                    listContrucExcel.push(recore)
                }
            })
        })
        .then(async result => {
            //Write
            let pathFileNew = './Excels/result.csv'
            let workbookNew = new ExcelJS.Workbook()
            let workSheetNew = workbookNew.addWorksheet('MeoooMeooo')
            let columnHeader = []
            for (let key of headerTitle) {
                let head = switchHeader(key)
                columnHeader.push(head)
            }
            workSheetNew.columns = columnHeader

            let rows = []

            for (let item of listContrucExcel) {
                let row = []
                for (let keyHead of headerTitle) {
                    if (keyHead === 'Steps') {
                        let step = item[keyHead].map(step => {
                            let des = `Step ${parseInt(step.step) + 1}:             Action-${step.action}                 ExpectedResult-${step.expectedResult}`
                            let desNullExpected = `Step ${parseInt(step.step) + 1}:             Action-${step.action}`
                            return step.expectedResult ? des : desNullExpected
                        })
                        row.push(step.join('\n'))
                    } else {
                        row.push(item[keyHead])
                    }
                }
                rows.push(row)
            }
            workSheetNew.addRows(rows)

            await workbookNew.csv.writeFile(pathFileNew);

            console.log('Starting...')
            res.json(listContrucExcel)
        })
})

let switchHeader = (key) => {
    let headMeo = {}
    switch (key) {
        case 'Title':
            headMeo = { header: 'Title', key: 'title', width: 40, bold: true, size: 16 }
            return headMeo
        case 'Steps':
            headMeo = { header: 'Steps', key: 'steps', width: 40, bold: true, size: 16 }
            return headMeo
        case 'Work-Item-Type':
            headMeo = { header: 'Work-Item-Type', key: 'work-item-type', width: 20, bold: true, size: 16 }
            return headMeo
        default:
            headMeo = { header: key, key: key.toLowerCase(), width: 20, bold: true, size: 16 }
            return headMeo
    }
}

let jsonPareStream = {
    "Step": 0,
    "Action": "s",
    "Expected Result": "result"
}

module.exports = router