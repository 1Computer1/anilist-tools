export function isTokenExpired(token: string): boolean {
  try {
    const expiry = JSON.parse(atob(token.split(".")[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  } catch {
    return true;
  }
}

export function getTokenUserId(token: string): number {
  return Number.parseInt(JSON.parse(atob(token.split(".")[1])).sub);
}
