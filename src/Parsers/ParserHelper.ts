import {ObjectTypes} from '../Enums/ObjectTypes';
import {ConstantParser} from './ConstantParser';
import {RuleParser} from "./RuleParser";

export class ParserHelper {
    public static routeObjectParser(ruleLocation: string, baseDefinition: any): any {
        let valueToReturn: any;
        let retData: any[];
        switch (true) {
            case baseDefinition[ObjectTypes.CONSTANT] !== undefined:
                retData = ConstantParser.ruleEntry(ruleLocation, baseDefinition['constant'], 'constant');
                valueToReturn = {
                    type: 'constant',
                    name: baseDefinition['constant'][0]['name'][0],
                    data: retData,
                };
                break;
            case baseDefinition[ObjectTypes.INTERFACE] !== undefined:
                retData = RuleParser.ruleEntry(ruleLocation, baseDefinition['contentHaul']['rule'][0]['definition'][0], 'rule');
                valueToReturn = {
                    type: 'rule',
                    name: baseDefinition['contentHaul']['rule'][0]['name'][0],
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
    }
}
