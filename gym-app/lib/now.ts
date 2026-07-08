export async function getNow(): Promise<Date> {
  return new Date();
}

export async function getNowMs(): Promise<number> {
  return Date.now();
}
