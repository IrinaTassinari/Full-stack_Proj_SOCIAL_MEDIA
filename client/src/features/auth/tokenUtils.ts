// Это функция проверяет: истек ли JWT token
// exp — это время, когда token истекает
type JwtPayload = {
  exp?: number; 
};

export const isTokenExpired = (token: string | null) => {
  // Если токена нет — считаем, что он истек
  if (!token) return true;

  try {
    // JWT token обычно выглядит так: header.payload.signature
    const payloadPart = token.split(".")[1];

    // Если второй части нет, token неправильный
    if (!payloadPart) return true;

    const base64Payload = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const normalizedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload;

    // Если нет срока действия — считаем token истекшим
    if (!payload.exp) return true;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
