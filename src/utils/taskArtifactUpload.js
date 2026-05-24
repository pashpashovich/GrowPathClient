import { taskAPI } from '../services/api';
import { putFileToPresignedUrl } from './presignedUpload';

const unwrap = (response) => response?.data?.data ?? response?.data;

const parsePresign = (raw) => {
  const body = unwrap({ data: raw }) ?? raw;
  if (!body) return null;
  if (typeof body === 'string') {
    return { uploadUrl: body, objectKey: null };
  }
  return {
    uploadUrl: body.uploadUrl,
    objectKey: body.objectKey,
  };
};

/** Загрузка файла-артефакта задачи (presign + confirm или multipart /files). */
export async function uploadTaskArtifactFile(taskId, file) {
  try {
    const presignRes = await taskAPI.presignTaskArtifactUpload(taskId, {
      fileName: file.name,
    });
    const { uploadUrl, objectKey } = parsePresign(presignRes.data) || {};

    if (uploadUrl && objectKey) {
      await putFileToPresignedUrl(uploadUrl, file);
      const confirmRes = await taskAPI.confirmTaskArtifactUpload(taskId, {
        objectKey,
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });
      return unwrap(confirmRes);
    }
  } catch {
    /* presign недоступен — multipart */
  }

  const formData = new FormData();
  formData.append('file', file);
  const res = await taskAPI.uploadTaskFile(taskId, formData);
  return unwrap(res);
}
