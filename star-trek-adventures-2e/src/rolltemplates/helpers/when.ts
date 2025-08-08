export function when(operand_1: string, operator: string, operand_2: string) {
  /* var operators = {
      'eq': (l:number,r:number) => l == r,              //  {{/when}}
      'noteq': (l:number,r:number) => l != r,
      'gt': (l:number,r:number) => (+l) > (+r),                        // {{#when var1 'eq' var2}}
      'gteq': (l:number,r:number) => ((+l) > (+r)) || (l == r),        //               eq
      'lt': (l:number,r:number) => (+l) < (+r),                        // {{else when var1 'gt' var2}}
      'lteq': (l:number,r:number) => ((+l) < (+r)) || (l == r),        //               gt
      'or': (l:number,r:number) => l || r,                             // {{else}}
      'and': (l:number,r:number) => l && r,                            //               lt
      '%': (l:number,r:number) => (l % r) === 0                        // {{/when}}
   },
   result:boolean = operators[operator](operand_1,operand_2);

   if (result) return options.fn(this);
   else  return options.inverse(this); */
  const operand_l: number = Number.parseInt(operand_1)
  const operand_r: number = Number.parseInt(operand_2)
  console.log(`left ${operand_l} ${typeof operand_l} and right  ${operand_r} ${typeof operand_r}`)
  switch (operator) {
    case ('eq') : return operand_l === operand_r
    case ('noteq') : return operand_l !== operand_r
    case ('gt') : return operand_l > operand_r
    case ('gteq') : return operand_l >= operand_r
    case ('lt') : return operand_l < operand_r
    case ('lteq') : return operand_l <= operand_r
    case ('or') : return operand_l || operand_r
    case ('and') : return operand_l && operand_r
    case ('%') : return operand_l % operand_r
  }
}
