import api, { v1ResourcePath } from './api';

const recipientsPath = v1ResourcePath('/recipients');
const distributionGroupsPath = v1ResourcePath('/distribution-groups');
const emailTemplatesPath = v1ResourcePath('/email-templates');
const mailingsPath = v1ResourcePath('/mailings');

const defaultPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

export const parseMailingList = (body) => {
  if (!body) {
    return { data: [], pagination: defaultPagination };
  }
  if (Array.isArray(body)) {
    return {
      data: body,
      pagination: {
        page: 1,
        limit: body.length,
        total: body.length,
        totalPages: 1,
      },
    };
  }
  const data = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.items)
      ? body.items
      : [];
  const pagination = body.pagination ?? {
    page: body.page ?? 1,
    limit: body.limit ?? data.length,
    total: body.total ?? data.length,
    totalPages: body.totalPages ?? (data.length ? 1 : 0),
  };
  return { data, pagination };
};

const LOOKUP_PAGE_SIZE = 100;

export const fetchAllMailingListItems = async (fetchPage) => {
  let page = 1;
  let totalPages = 1;
  const all = [];
  do {
    const res = await fetchPage({ page, limit: LOOKUP_PAGE_SIZE });
    const parsed = parseMailingList(res.data);
    all.push(...parsed.data);
    totalPages = parsed.pagination.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return all;
};

export const mailingAPI = {
  getRecipients: (params) => api.get(recipientsPath, { params }),
  getRecipientById: (id) => api.get(`${recipientsPath}/${id}`),
  createRecipient: (data) => api.post(recipientsPath, data),
  updateRecipient: (id, data) => api.put(`${recipientsPath}/${id}`, data),
  deleteRecipient: (id) => api.delete(`${recipientsPath}/${id}`),

  getDistributionGroups: (params) => api.get(distributionGroupsPath, { params }),
  getDistributionGroupById: (id) => api.get(`${distributionGroupsPath}/${id}`),
  createDistributionGroup: (data) => api.post(distributionGroupsPath, data),
  updateDistributionGroup: (id, data) => api.put(`${distributionGroupsPath}/${id}`, data),
  deleteDistributionGroup: (id) => api.delete(`${distributionGroupsPath}/${id}`),
  getDistributionGroupRecipients: (id) =>
    api.get(`${distributionGroupsPath}/${id}/recipients`),
  addRecipientToGroup: (groupId, data) =>
    api.post(`${distributionGroupsPath}/${groupId}/recipients`, data),
  removeRecipientFromGroup: (groupId, recipientId) =>
    api.delete(`${distributionGroupsPath}/${groupId}/recipients`, {
      params: { recipientId },
    }),

  getEmailTemplates: (params) => api.get(emailTemplatesPath, { params }),
  getEmailTemplateById: (id) => api.get(`${emailTemplatesPath}/${id}`),
  createEmailTemplate: (data) => api.post(emailTemplatesPath, data),
  updateEmailTemplate: (id, data) => api.put(`${emailTemplatesPath}/${id}`, data),
  deleteEmailTemplate: (id) => api.delete(`${emailTemplatesPath}/${id}`),
  presignTemplateAttachment: (data) =>
    api.post(`${emailTemplatesPath}/attachments/presign-upload`, data),
  downloadTemplateAttachment: (templateId, attachmentId) =>
    api.get(
      `${emailTemplatesPath}/${templateId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    ),

  getMailings: (params) => api.get(mailingsPath, { params }),
  getMailingById: (id) => api.get(`${mailingsPath}/${id}`),
  createMailing: (data) => api.post(mailingsPath, data),
  updateMailing: (id, data) => api.put(`${mailingsPath}/${id}`, data),
  deleteMailing: (id) => api.delete(`${mailingsPath}/${id}`),
  sendMailing: (id) => api.post(`${mailingsPath}/${id}/send`),

  fetchAllEmailTemplates: () =>
    fetchAllMailingListItems((params) => api.get(emailTemplatesPath, { params })),

  fetchAllDistributionGroups: () =>
    fetchAllMailingListItems((params) => api.get(distributionGroupsPath, { params })),
};
