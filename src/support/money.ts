/** "Item total: $39.98" -> 39.98 */
export function parseMoney(text: string): number {
  const match = text.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (!match?.[1]) {
    throw new Error(`Could not parse a money amount from "${text}"`);
  }
  return Number(match[1]);
}

export const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);
