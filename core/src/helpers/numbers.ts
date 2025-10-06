export function percentage(percent: number, fixed = 2) {
  if (isNaN(percent)) {
    return "New";
  }
  return percent.toFixed(fixed) + "%";
}

export function mulberry32(a: number) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const BITS26 = 2 ** 26;
function rand26() {
  return Math.floor(Math.random() * BITS26);
}
export function rand52() {
  // Javascript のビット数は53ビットなので52bitの乱数を生成する。ただし Math.random は環境によって 32bitしかないので
  // Math.random を2回呼んで上位26ビットと下位26ビットにそれぞれ使う
  return rand26() * BITS26 + rand26();
}

// stepfunction に渡すためのユニーク文字列を生成するための関数
// base62 (base64 から +/を除去したもの)でエンコードした16文字を返す
export function randomStringForStepFunction() {
  const rand = () => Math.floor(Math.random() * 62 ** 4);
  return numberToBase62(rand()) +
    numberToBase62(rand()) +
    numberToBase62(rand()) +
    numberToBase62(rand());
}

function numberToBase62(num: number) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const base = CHARS.length;
  if (num < 0) {
    throw new Error();
  }
  const chars: string[] = [];
  while (num > 0) {
    const index = num % base;
    num = Math.floor(num / base);
    chars.push(CHARS[index])
  }
  return chars.reverse().join("");
}


/**
 * "234.45px" のような文字列から 234.45 という number を得る関数
 * @param styleValue 
 * @returns 
 */
export function getNumberFromStyle(styleValue: string) {
  const match = styleValue.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}