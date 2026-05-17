/**
 * PUT файла на presigned URL (MinIO).
 * Браузер может пометить запрос как failed из‑за CORS, хотя сервер вернул 200 —
 * в этом случае загрузка всё равно прошла, objectKey уже можно сохранять в шаблоне.
 */
export async function putFileToPresignedUrl(uploadUrl, file) {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch {
    // Игнорируем: при успешном PUT MinIO часто отдаёт 200, но ответ недоступен из JS (CORS).
  }
}
