import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge, ContactStatusBadge } from '@/components/ui/badge';
import { IdLine, Row, Rows, Section } from '@/components/detail/detail-parts';
import { CONTACT_TOPIC_LABEL } from '@/lib/ads/labels';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { ContactListItem } from '@/lib/api/types';

export function ContactDetailPanel({
  contact,
  onClose,
  onSetStatus,
  onDelete,
}: {
  contact: ContactListItem | null;
  onClose: () => void;
  onSetStatus: (
    contact: ContactListItem,
    status: 'OPENED' | 'RESOLVED',
  ) => void;
  onDelete: (contact: ContactListItem) => void;
}) {
  return (
    <Modal
      open={contact !== null}
      onClose={onClose}
      variant="panel"
      title="Contact message"
      description={contact?.name}
      footer={
        contact && (
          <>
            <Button
              variant="subtleDanger"
              onClick={() => {
                onDelete(contact);
                onClose();
              }}
            >
              Delete
            </Button>
            <Button
              variant={contact.status === 'RESOLVED' ? 'secondary' : 'success'}
              onClick={() => {
                onSetStatus(
                  contact,
                  contact.status === 'RESOLVED' ? 'OPENED' : 'RESOLVED',
                );
                onClose();
              }}
            >
              {contact.status === 'RESOLVED' ? 'Reopen' : 'Mark resolved'}
            </Button>
          </>
        )
      }
    >
      {contact && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ContactStatusBadge status={contact.status} />
            <Badge tone="brand">
              {CONTACT_TOPIC_LABEL[contact.topic] ?? contact.topic}
            </Badge>
          </div>

          <Section title="Message">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {contact.message}
            </p>
          </Section>

          <Section title="Sender">
            <Rows>
              <Row label="Name">{contact.name}</Row>
              {contact.email && (
                <Row label="Email">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-brand-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </Row>
              )}
              {contact.phone && (
                <Row label="Phone">
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-brand-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </Row>
              )}
              <Row label="Received">
                {formatDateTime(contact.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(contact.createdAt)})
                </span>
              </Row>
            </Rows>
            <IdLine id={contact.id} />
          </Section>
        </>
      )}
    </Modal>
  );
}
