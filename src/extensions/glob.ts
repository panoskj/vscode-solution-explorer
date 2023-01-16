import * as fs from "@extensions/fs";
import * as path from "@extensions/path";

export function globMatch(pattern: string, input: string): RegExpMatchArray | null {
    if (!isGlobPattern(pattern)) {
        return input.match(pattern);
    }

    const regExp = toRegExp(pattern);
    return regExp.exec(input);
}

export function globTest(pattern: string | string[], input: string): boolean {
    if (typeof pattern === "string") {
        pattern = [ pattern ];
    }
    for (const p of pattern) {
        if (isGlobPattern(p)) {
            if (toRegExp(p).exec(input)) {
                return true;
            }
        } else if (input.endsWith(p)) {
            return true;
        }
    }

   return false;
}

export async function globFileSearch(searchPath: string, pattern: string, exclude: (fullpath: string) => boolean, statistics?: Record<string, number>):
    Promise<{ filepath: string, directory: boolean }[]> {
            
    if (isGlobPattern(pattern)) {
        const files = await fs.readdirinfo(searchPath);

        const results: { filepath: string, directory: boolean }[] = [];
        await Promise.all(files.map(async ([name, directory]) => {
            const filepath = path.join(searchPath, name);
            if (!globTest(pattern, filepath) || exclude(filepath)) {
                return;
            }
            results.push({ filepath, directory });
            if (directory) {
                const childResults = await globFileSearch(filepath, pattern, exclude, statistics);
                results.push(...childResults);
            }
        }));
        return results;
    }
    else {
        const filepath = path.join(searchPath, pattern);
        if (exclude(filepath)) return [];
        try {
            return [{ filepath, directory: await fs.isDirectory(filepath) }];
        }
        catch {
            return [{ filepath, directory: path.extname(filepath) === "" }];
        }
    }
}

export function isGlobPattern(pattern: string): boolean {
    return pattern.indexOf("*") >= 0
        || pattern.indexOf("?") >= 0
        || pattern.indexOf("[") >= 0
        || pattern.indexOf("{") >= 0;
}

function toRegExp(globPattern: string): RegExp {
    let regExpString = "", isRange = false, isBlock = false;
    for(let i = 0; i < globPattern.length; i++) {
        const c = globPattern[i];
        if ([".", "/", "\\", "$", "^"].indexOf(c) !== -1) {
            regExpString += "\\" + c;
        } else if (c === "?") {
            regExpString += ".";
        } else if (c === "[") {
            isRange = true;
            regExpString += "[";
        } else if (c === "]") {
            isRange = false;
            regExpString += "]";
        } else if (c === "!") {
            if (isRange) {
                regExpString += "^";
            } else {
                regExpString += "!";
            }
        } else if (c === "{") {
            isBlock = true;
            regExpString += "(";
        } else if (c === "}") {
            isBlock = false;
            regExpString += ")";
        } else if (c === ",") {
            if (isBlock) {
                regExpString += "|";
            } else {
                regExpString += "\\,";
            }
        } else if (c === "*") {
            let nextChar = globPattern[i + 1];
            if (nextChar === "*") {
                regExpString += ".*";
                i++;
                nextChar = globPattern[i + 1];
                if (nextChar === "/" || nextChar === "\\") {
                    i++;
                }
            } else {
                regExpString += "[^/]*";
            }
        } else {
            regExpString += c;
        }
    }
    return new RegExp(regExpString);
}
