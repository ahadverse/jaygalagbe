import { useState } from 'react';
import { useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { BookmarkIcon, DownloadIcon } from '@/components/ui/icons';
import { downloadCsv } from '@/lib/api/export';
import { useSavedViews } from '@/lib/views/use-saved-views';
import { useToast } from '@/lib/toast/toast-context';
import { ApiError, type QueryParams } from '@/lib/api/client';

/**
 * Exports the whole filtered result set, not the page on screen — the server
 * re-runs the same query without pagination.
 */
export function ExportButton({
  resource,
  params,
}: {
  resource: string;
  params: QueryParams;
}) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  return (
    <Button
      variant="secondary"
      size="md"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await downloadCsv(resource, params);
        } catch (error) {
          toast.error(
            error instanceof ApiError ? error.message : 'Export failed',
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {!busy && <DownloadIcon className="h-3.5 w-3.5" />}
      Export
    </Button>
  );
}

/**
 * Saves the current URL under a name. Works for any table because the whole
 * view — search, filters, sort, page size — already lives in the URL.
 */
export function SaveViewButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { save } = useSavedViews();
  const { pathname, search } = useLocation();
  const toast = useToast();

  function commit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    save(trimmed, pathname, search);
    toast.success(`Saved "${trimmed}" to the sidebar`);
    setName('');
    setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        <BookmarkIcon className="h-3.5 w-3.5" />
        Save view
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Save this view"
        description="The current search, filters and sort, pinned to the sidebar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={name.trim() === ''}
              onClick={commit}
            >
              Save
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit();
            }}
            maxLength={40}
            autoFocus
            placeholder="Overdue in Dhaka"
            className="h-9 w-full rounded-md border border-border-strong bg-card px-2.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Saving again under the same name replaces the existing view.
        </p>
      </Modal>
    </>
  );
}
