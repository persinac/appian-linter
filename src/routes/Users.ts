import { UserDao } from '@daos';
import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';
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
const projectRootPath = 'C:\\Users\\AlexPersinger\\WebstormProjects\\appian-linter';

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
 *                      Post FILE - "POST /api/users/file"
 ******************************************************************************/
router.post('/file', upload.single('file'), (req: any, res: any, next: any) => {
    const parser = new xml2js.Parser();
    fs.createReadStream(req.file.path)
        .pipe(unzipper.Extract({ path: `./uploads/unzipped/${req.file.filename.substr(0, req.file.filename.indexOf('.'))}` }))
        .on('entry', (entry: any) => entry.autodrain())
        .promise()
        .then(() => {
            const lintResult: any = [];
            let ruleDef = '';
            let retData: any[] = [];
            const directory = `${projectRootPath}\\uploads\\unzipped\\${req.file.filename.substr(0, req.file.filename.indexOf('.'))}\\content`;

            fs.readdirSync(directory).forEach((file: any) => {
                const fullFilePath = directory + '\\' + file;
                try {
                    fs.accessSync(fullFilePath);
                    const data = fs.readFileSync(fullFilePath);
                    parser.parseString(data, (err: any, result: any) => {
                        const baseDefinition = result['contentHaul'];
                        switch (true) {
                            case baseDefinition['constant'] !== undefined:
                                retData = ParserHelper.routeObjectParser(ruleLocation, baseDefinition['constant']);
                                lintResult.push({
                                    type: 'constant',
                                    name: baseDefinition['constant'][0]['name'][0],
                                    data: retData,
                                });

                                break;
                            case baseDefinition['rule'] !== undefined:
                                ruleDef = result['contentHaul']['rule'][0]['definition'][0];
                                retData = ParserHelper.routeObjectParser(ruleLocation, ruleDef);
                                lintResult.push({
                                    type: 'rule',
                                    name: result['contentHaul']['rule'][0]['name'][0],
                                    data: retData,
                                });
                                break;
                            default:
                                lintResult.push({
                                    type: 'unknown',
                                    name: 'unknown',
                                    data: {},
                                });
                                break;
                        }
                    });
                } catch (e) {
                    res.send(e);
                }
            });
            console.log('FIN');
            res.send(lintResult);
        })
        .catch((e: any) => {
            console.log(e);
        });
});

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response) => {
    try {
        const users = await userDao.getAll();
        return res.status(OK).json({users});
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});

/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(BAD_REQUEST).json({
                error: paramMissingError,
            });
        }
        await userDao.add(user);
        return res.status(CREATED).end();
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});

/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put('/update', async (req: Request, res: Response) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(BAD_REQUEST).json({
                error: paramMissingError,
            });
        }
        user.id = Number(user.id);
        await userDao.update(user);
        return res.status(OK).end();
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});

/******************************************************************************
 *                    Delete - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as ParamsDictionary;
        await userDao.delete(Number(id));
        return res.status(OK).end();
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
