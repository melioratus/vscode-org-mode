import * as vscode from 'vscode';
import {getLine, getPrefix, getStarPrefixCount, inSubsection} from './general-utils';

export function findBeginningOfSectionWithHeader(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    let beginningOfSection = findBeginningOfSection(document, pos, levelSym);
    let prevLineNum = beginningOfSection.line - 1;
    if(prevLineNum >= 0 && document.lineAt(prevLineNum).text.match(/^\*+\s/)) {
        return new vscode.Position(prevLineNum, 0);
    }
    return beginningOfSection;
}

export function findBeginningOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    let sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine--;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while(curLine > 0 && inSubsection(curLinePrefix, sectionRegex))

    if(curPos) {
        curPos = new vscode.Position(curPos.line + 1, 0);
    }

    return curPos;
}

export function findEndOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    if(pos.line === document.lineCount - 1) {
        return pos;
    }
    let sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while(curLine < document.lineCount - 1 && inSubsection(curLinePrefix, sectionRegex))

    curPos = new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1);

    return curPos;
}

//returns regex that will match a subsection and facilitate respecting section content
export function getSectionRegex(prefix: string) {
    let regex = null;
    if(prefix.match(/\d+./)) {    //starting on numeric line
        regex = /\d+./;
    }
    else if(prefix === "") {      //starting on other non-header text line
        regex = /^$/;
    }
    else if(prefix === "-") {
        regex = /^-\s$/;
    }
    else if(prefix.startsWith("*")) {                          //starting on header line
        let numStars = getStarPrefixCount(prefix);
        regex = new RegExp(`\\*{${numStars},}`);
    }

    return regex;
}