import {ObjectTypes} from "../Enums/ObjectTypes";

export class ParserHelper {
    public static routeObjectParser(baseDefinition: any) {
        switch (true) {
            case baseDefinition[ObjectTypes.CONSTANT] !== undefined:
                retData = constantParser(baseDefinition['constant'], "constant");
                lintResult.push({
                    "type": "constant",
                    "name": baseDefinition['constant'][0]['name'][0],
                    "data": retData
                });
                break;
            case baseDefinition[ObjectTypes.INTERFACE] !== undefined:
                ruleDef = result['contentHaul']['rule'][0]['definition'][0];
                retData = ruleParser(ruleDef, "rule");
                lintResult.push({
                    "type": "rule",
                    "name": result['contentHaul']['rule'][0]['name'][0],
                    "data": retData
                });
                break;
            default:
                lintResult.push({
                    "type": "unknown",
                    "name": "unknown",
                    "data": {}
                });
                break;
        }
    }
}