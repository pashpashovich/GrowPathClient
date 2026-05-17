export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function filenameFromContentDisposition(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8) return decodeURIComponent(utf8[1]);
  const quoted = /filename="([^"]+)"/i.exec(contentDisposition);
  if (quoted) return quoted[1];
  const plain = /filename=([^;]+)/i.exec(contentDisposition);
  if (plain) return plain[1].trim();
  return fallback;
}

export async function saveAxiosBlobResponse(response, fallbackFilename) {
  const contentType = response.headers?.['content-type'] || '';
  if (contentType.includes('application/json') || contentType.includes('text/json')) {
    const text = await response.data.text();
    let message = 'Не удалось скачать отчёт';
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  const filename = filenameFromContentDisposition(
    response.headers?.['content-disposition'],
    fallbackFilename
  );
  triggerBlobDownload(response.data, filename);
}

export async function getAxiosBlobErrorMessage(error, fallback = 'Не удалось скачать отчёт') {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed.message || parsed.error || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || error?.message || fallback;
}
