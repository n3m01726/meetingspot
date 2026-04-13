const crypto = require("crypto");

const sessions   = new Map();
const cookieName = "meetingspot_session";

function parseCookies(headerValue) {
  if (!headerValue) return {};

  return headerValue.split(";").reduce((accumulator, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return accumulator;
    accumulator[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return accumulator;
  }, {});
}

function readSessionUserId(request) {
  const cookies      = parseCookies(request.headers.cookie || "");
  const sessionToken = cookies[cookieName];
  if (!sessionToken) return null;
  return sessions.get(sessionToken) || null;
}

function createSession(userId) {
  const token = crypto.randomUUID();
  sessions.set(token, userId);
  return token;
}

function clearSession(request) {
  const cookies      = parseCookies(request.headers.cookie || "");
  const sessionToken = cookies[cookieName];
  if (sessionToken) sessions.delete(sessionToken);
}

function sessionCookieValue(token) {
  return `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`;
}

function expiredSessionCookieValue() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

module.exports = {
  readSessionUserId,
  createSession,
  clearSession,
  sessionCookieValue,
  expiredSessionCookieValue,
};