import * as fs from 'fs';

export class ConstantParser {
    public static ruleEntry(ruleLocation: any, definition: any, type: string) {
        const consName = definition[0]['name'][0];
        const consDescription = definition[0]['description'][0];
        const consValueType = definition[0]['typedValue'][0]['type'][0]['name'][0];
        const consEnvSpecific = definition[0]['typedValue'][0]['isEnvironmentSpecific'];
        let consValue = '';
        if (consEnvSpecific !== undefined) {
            consValue = definition[0]['typedValue'][0]['value'][0];
        }

        const dataToReturn: any = [];
        if (fs.existsSync(ruleLocation)) {
            const rawData: Buffer = fs.readFileSync(ruleLocation);
            const jsonRule = JSON.parse(rawData.toString());
            const baseRule = jsonRule['constants'][0]['naming'];
            const idxToCheck = baseRule[0]['type-location'];

            const typeRule = `type-${consValueType}`;
            const retVal = ConstantParser.typeCheckRule(typeRule, baseRule, consName, idxToCheck);
            if (retVal !== undefined && retVal.length > 0) {
                dataToReturn.push({[typeRule]: retVal});
            }
        }
        return dataToReturn;
    }

    private static typeCheckRule(typeRule: any, baseRule: any, name: any, idxToCheck: any) {
        let retVal = '';
        const rule = baseRule.filter((s: any) => s[`${typeRule}`] !== undefined ? s[`${typeRule}`] : '')[0];
        try {
            if (rule[`${typeRule}`] !== undefined) {
                const splitName = name.split('_');
                if (splitName[idxToCheck] !== rule[`${typeRule}`]) {
                    retVal = `Use: ${rule[`${typeRule}`]} instead of ${splitName[idxToCheck]}`;
                }
            }
        } catch (e) {
            console.log(name);
            console.log(e);
        }
        return retVal;
    }
}