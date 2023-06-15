/**
 * Sum numbers
 * @param args
 */
export function sum(...args: number[]) {
  console.log("sum");
  return args.reduce((prev, curr) => prev + curr, 0);
}
