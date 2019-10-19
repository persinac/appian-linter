import * as fs from 'fs';

/***********************************
 * GW Standards:
    - Uppercase, separated by underscores.
    - Must additionally prefix the data type returned.
    - [NOT SURE WE CAN ENFORCE THIS ONE] Documents must exactly match the name of the corresponding file
    - PIRS_<TYPE>_<OBJECT>
 *
 */

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
            jsonRule['constants'].forEach((r: any) => {
                switch (true) {
                    case r['naming'] !== undefined:
                        const idxToCheck = r['naming'][0]['type-location'];

                        const typeRule = `type-${consValueType}`;
                        const retVal = ConstantParser.typeCheckRule(typeRule, r['naming'], consName, idxToCheck);
                        if (retVal !== undefined && retVal.length > 0) {
                            dataToReturn.push({[typeRule]: retVal});
                        }
                        break;
                    case r['is-all-upper'] !== undefined:
                        if (!ConstantParser.isAllUpper(consName)) {
                            dataToReturn.push({'is-all-upper': 'Please ensure that constant names are all uppercase'});
                        }
                        break;
                    case r['alpha-underscore'] !== undefined:
                        if (!ConstantParser.onlyAlphaUnderscore(consName)) {
                            dataToReturn.push({'alpha-underscore': 'Please ensure that constant names only contains underscores and alphabetical chars'});
                        }
                        break;
                    default:
                        console.log('Unsupported rule');
                }
            });
        }
        return dataToReturn;
    }

    /******
     * Ensure the constant name only includes alphabet and underscores
     * @param consName
     */
    private static onlyAlphaUnderscore(consName: string) {
        // possibly use this same logic for isAllUpper?
        const cleanedName = consName.replace(/[a-zA-Z]/g, '').replace(/_+/g, '');
        console.log('CLEANED NAME: ');
        console.log(cleanedName);
        return cleanedName.length === 0;
    }

    private static isAllUpper(consName: string) {
        const cleanedName = consName.split('_').join('');
        let isAllUpper: boolean = true;
        [...cleanedName].forEach((c: string) => {
            if (c === c.toLowerCase()) {
                isAllUpper = false;
            }
        });
        return isAllUpper;
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

    private static isNameAllUpperCase(name: string) {

    }
}