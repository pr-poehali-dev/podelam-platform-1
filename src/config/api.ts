import urls from '../../backend/func2url.json';

export const API = {
  chat: urls['chat'],
  inviteGame: urls['invite-game'],
  userCheck: urls['user-check'],
  friends: urls['friends'],
  adminAuth: urls['admin-auth'],
  geoDetect: urls['geo-detect'],
  sendOtp: urls['send-otp'],
  verifyOtp: urls['verify-otp'],
  siteSettings: urls['site-settings'],
  matchmaking: urls['matchmaking'],
  onlineMove: urls['online-move'],
  applyDailyDecay: urls['apply-daily-decay'],
  gameHistory: urls['game-history'],
  finishGame: urls['finish-game'],
  ratingSettings: urls['rating-settings'],
  adminStats: urls['admin-stats'],
  leaderboard: urls['leaderboard'],
} as const;

export default API;