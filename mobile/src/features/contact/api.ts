import { apiPost } from '../../api/client';

export const CONTACT_TOPICS = [
  { value: 'general', label: 'General question' },
  { value: 'listing', label: 'A listing on the site' },
  { value: 'advertising', label: 'Posting or boosting an ad' },
  { value: 'account', label: 'My account' },
  { value: 'report', label: 'Report a problem' },
  { value: 'other', label: 'Something else' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

export function sendContactMessage(input: {
  name: string;
  email?: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
}): Promise<void> {
  return apiPost<void>('/contact', input, { auth: false });
}
