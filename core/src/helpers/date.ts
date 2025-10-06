export function parseYYYYMMDD(dateString: string): Date | null {
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月は0から始まるため-1
  const day = dateString.length === 8 ? parseInt(dateString.substring(6, 8), 10) : 1; // 日がない場合は1日とする

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null; // パース失敗
  }

  const date = new Date(year, month, day);

  // 不正な日付（例: 2月30日）をチェック
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatYYYYMMDD(date: Date | string | undefined): string {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  if (!date) {
    return ""
  }
  if (date.length === 6) {
    // YYYYMM 形式の場合
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    return `${year}/${month}`;
  } else if (date.length === 8) {
    // YYYYMMDD 形式の場合
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    return `${year}/${month}/${day}`;
  } else {
    // 不正な形式の場合、元の文字列を返すか、エラーをスローする
    return date; // または throw new Error("Invalid date format");
  }
}