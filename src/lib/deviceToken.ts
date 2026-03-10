const STORAGE_KEY = 'chess_device_token';

export function getDeviceToken(): string {
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = generateToken();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}

function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export default getDeviceToken;
