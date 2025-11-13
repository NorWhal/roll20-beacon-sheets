/**
 *
 */
export function r20ify(rec: Record<string, any>) {
  console.log(rec);
  const stringified = JSON.stringify(rec);
  const sanitized = stringified
    .replace(/:/g, "%COLON%")
    .replace(/"/g, "%QUOTE%")
    .replace(/,/g, "%COMMA%");
    // .replace(/;/g, "SEMI")
    // .replace(/\(/g, "LPAREN")
    // .replace(/\)/g, "RPAREN");

  return sanitized;
}

export function r20Parse(r20String: string) {
  const parsedString = r20String
    .replace(/(%COLON%)/g, ":")
    .replace(/(%QUOTE%)/g, "\"")
    .replace(/%COMMA%/g, ",");
    // .replace(/(SEMI)/g, ";")
    // .replace(/(LPAREN)/g, "(")
    // .replace(/(RPAREN)/g, ")");
  const parsedRecord: Record<string, any> = JSON.parse(parsedString);
  console.log(parsedRecord);

  return parsedRecord;
}
