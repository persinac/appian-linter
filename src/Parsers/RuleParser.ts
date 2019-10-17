import * as fs from 'fs';

export class RuleParser {
    public static ruleEntry(ruleLocation: any, definition: any, type: string) {
        const dataToReturn: any = [];
        if (fs.existsSync(ruleLocation)) {
            const rawData: Buffer = fs.readFileSync(ruleLocation);
            const jsonRule = JSON.parse(rawData.toString());
            jsonRule['expression_rules'].forEach((r: any) => {
                // console.log(r);
                switch (true) {
                    case r['maxLineLength'] !== undefined:
                        // console.log('Max line length: ' + r['maxLineLength']);
                        const lineByLine = definition.split('\n');
                        const maxLineOffenses: Array<{ lineNumber: number; }> = [];
                        // console.log(lineByLine.length);
                        lineByLine.forEach((line: string, index: number) => {
                            const retVal = RuleParser.maxLineLength(line.trim(), r['maxLineLength']);
                            if (retVal) {
                                maxLineOffenses.push({lineNumber: (index + 1)});
                            }
                        });
                        dataToReturn.push({maxLineOffenses});
                        break;
                    case r['evenIndentationNumber'] !== undefined:
                        break;
                    default:
                        console.log('Unsupported rule');
                }
            });
        }
        return dataToReturn;
    }

    private static maxLineLength(currentLine: string, lengthOfLine: number) {
        return currentLine.length > lengthOfLine;
    }
}