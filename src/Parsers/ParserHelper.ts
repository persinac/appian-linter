import {ObjectTypes} from '../Enums/ObjectTypes';
import {ConstantParser} from './ConstantParser';
import {RuleParser} from './RuleParser';
import * as fs from 'fs';

export class ParserHelper {
    public static routeObjectParser(ruleLocation: string, baseDefinition: any): any {
        let valueToReturn: any;
        let retData: any[];
        switch (true) {
            case baseDefinition[ObjectTypes.CONSTANT] !== undefined:
                retData = ConstantParser.ruleEntry(ruleLocation, baseDefinition[ObjectTypes.CONSTANT], 'constant');
                valueToReturn = {
                    type: 'constant',
                    name: baseDefinition[ObjectTypes.CONSTANT][0]['name'][0],
                    data: retData,
                };
                break;
            case baseDefinition[ObjectTypes.INTERFACE] !== undefined:
                retData = RuleParser.ruleEntry(ruleLocation, baseDefinition[ObjectTypes.INTERFACE][0]['definition'][0], 'rule');
                valueToReturn = {
                    type: 'rule',
                    name: baseDefinition[ObjectTypes.INTERFACE][0]['name'][0],
                    data: retData,
                };
                break;
            default:
                valueToReturn = {
                    type: 'unknown',
                    name: 'unknown',
                    data: {},
                };
                break;
        }
        return valueToReturn;
    }
}
