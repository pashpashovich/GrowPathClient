/**
 * Превращает сырой ответ бэкенда/Keycloak в короткое сообщение для пользователя.
 */
export function getLoginErrorMessage(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  const raw =
    (typeof data === 'string' && data) ||
    data?.message ||
    data?.error_description ||
    data?.error ||
    error.message ||
    '';

  const text = String(raw).toLowerCase();

  if (
    status === 401 ||
    text.includes('invalid_grant') ||
    text.includes('invalid user credentials') ||
    text.includes('invalid credentials') ||
    text.includes('unauthorized') ||
    text.includes('authentication failed')
  ) {
    return 'Неверный email или пароль.';
  }

  if (status === 403 || text.includes('forbidden')) {
    return 'Доступ запрещён. Обратитесь к администратору.';
  }

  if (!error.response || text.includes('network')) {
    return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.';
  }

  if (status >= 500) {
    return 'Сервер временно недоступен. Попробуйте позже.';
  }

  const msg = typeof data === 'string' ? data : data?.message;
  if (msg && typeof msg === 'string' && msg.length < 120 && !msg.includes('{')) {
    return msg;
  }

  return 'Не удалось войти. Попробуйте ещё раз.';
}
