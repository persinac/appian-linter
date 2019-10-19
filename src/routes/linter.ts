import { UserDao } from '@daos';
import { Router} from 'express';
import multer from 'multer';
import uuid from 'uuid';
import unzipper from 'unzipper';
import xml2js from 'xml2js';
import {ParserHelper} from '../Parsers/ParserHelper';

const fs = require('fs');
const path = require('path');
const ruleName = '\\rules\\testing.json';
const projectRootName = 'appian-linter';
const appnLinterNum = __dirname.indexOf(projectRootName);
const ruleLocation = __dirname.substring(0, appnLinterNum) + projectRootName + ruleName;
const projectRootPath = 'C:\\Users\\apfba\\WebstormProjects\\appian-linter';

// Init shared
const router = Router();
const userDao = new UserDao();

// Init storage
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, './uploads/');
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, uuid.v4() + path.extname(file.originalname));
    },
});

// Init uploader
const upload  = multer({storage});

/******************************************************************************
 *                      Post ZIPPED PACKAGE - "POST /api/linter/package"
 *                      Need to break this code up a bit to be reusable
 *                      - Unzipping a file
 *                      - Parsing XML
 *                      - Calling rule parser
 ******************************************************************************/
router.post('/package', upload.single('package'), (req: any, res: any, next: any) => {
    const parser = new xml2js.Parser();
    fs.createReadStream(req.file.path)
        .pipe(unzipper.Extract({ path: `./uploads/unzipped/${req.file.filename.substr(0, req.file.filename.indexOf('.'))}` }))
        .on('entry', (entry: any) => entry.autodrain())
        .promise()
        .then(() => {
            const lintResult: any = [];
            const directory = `${projectRootPath}\\uploads\\unzipped\\${req.file.filename.substr(0, req.file.filename.indexOf('.'))}\\content`;
            if (fs.lstatSync(directory).isDirectory()) {
                fs.readdir(directory, (fileErr: any, files: any) => {
                    files.forEach((file: any) => {
                        const fullFilePath = directory + '\\' + file;
                        try {
                            fs.accessSync(fullFilePath);
                            const data = fs.readFileSync(fullFilePath);
                            parser.parseString(data, (err: any, result: any) => {
                                const baseDefinition = result['contentHaul'];
                                lintResult.push(
                                    ParserHelper.routeObjectParser(
                                        ruleLocation,
                                        baseDefinition,
                                    ),
                                );
                            });
                        } catch (e) {
                            console.log(e);
                            lintResult.push({
                                type: 'unknown',
                                name: 'unknown',
                                data: e,
                            });
                        }
                    });
                    res.send(lintResult);
                });
            }
        })
        .catch((e: any) => {
            console.log(e);
            res.send(e);
        });
});

/******************************************************************************
 *                      Post SINGLE FILE - "POST /api/linter/file"
 *                      TBD - Not yet implemented. Just copied the package linter
 *                      as a place holder
 ******************************************************************************/
router.post('/file', upload.single('file'), (req: any, res: any, next: any) => {
    const parser = new xml2js.Parser();
    fs.createReadStream(req.file.path)
        .pipe(unzipper.Extract({ path: `./uploads/unzipped/${req.file.filename.substr(0, req.file.filename.indexOf('.'))}` }))
        .on('entry', (entry: any) => entry.autodrain())
        .promise()
        .then(() => {
            const lintResult: any = [];
            const directory = `${projectRootPath}\\uploads\\unzipped\\${req.file.filename.substr(0, req.file.filename.indexOf('.'))}\\content`;
            if (fs.lstatSync(directory).isDirectory()) {
                fs.readdir(directory, (fileErr: any, files: any) => {
                    files.forEach((file: any) => {
                        const fullFilePath = directory + '\\' + file;
                        try {
                            fs.accessSync(fullFilePath);
                            const data = fs.readFileSync(fullFilePath);
                            parser.parseString(data, (err: any, result: any) => {
                                const baseDefinition = result['contentHaul'];
                                console.log(ruleLocation);
                                lintResult.push(
                                    ParserHelper.routeObjectParser(
                                        ruleLocation,
                                        baseDefinition,
                                    ),
                                );
                            });
                        } catch (e) {
                            console.log(e);
                            lintResult.push({
                                type: 'unknown',
                                name: 'unknown',
                                data: e,
                            });
                        }
                    });
                    res.send(lintResult);
                });
            }
        })
        .catch((e: any) => {
            console.log(e);
            res.send(e);
        });
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
