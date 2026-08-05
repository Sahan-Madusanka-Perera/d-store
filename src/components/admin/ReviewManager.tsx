'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Check, EyeOff, Trash2, Plus, Pencil, X, Save, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import {
  REVIEW_SOURCES,
  REVIEW_SOURCE_LABEL,
  type Review,
  type ReviewSource,
  type ReviewStatus,
} from '@/lib/reviews';

/**
 * Review moderation and authoring.
 *
 * Two jobs in one place: decide what visitors' submissions do, and enter reviews the
 * shop received somewhere else. The second is why `source`, `reviewed_on` and
 * `source_url` are editable — a Facebook review pasted here should still say Facebook
 * and still carry its original date, rather than quietly presenting as a site review
 * written today.
 */

const STATUS_TABS: { value: ReviewStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'all', label: 'All' },
];

const BLANK_DRAFT = {
  author_name: '',
  body: '',
  rating: 5,
  source: 'facebook' as ReviewSource,
  source_url: '',
  reviewed_on: new Date().toISOString().slice(0, 10),
  display_order: '' as string | number,
  status: 'published' as ReviewStatus,
};

function StarPicker({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= value;
        const star = (
          <Star
            className={`${px} ${filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
            aria-hidden="true"
          />
        );
        if (!onChange) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            aria-pressed={value === n}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<ReviewStatus | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load reviews');
      setReviews(await res.json());
    } catch (error) {
      console.error(error);
      toast.error('Could not load reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (tab === 'all' ? reviews : reviews.filter(r => r.status === tab)),
    [reviews, tab],
  );

  const counts = useMemo(
    () => ({
      pending: reviews.filter(r => r.status === 'pending').length,
      published: reviews.filter(r => r.status === 'published').length,
      hidden: reviews.filter(r => r.status === 'hidden').length,
      all: reviews.length,
    }),
    [reviews],
  );

  const patch = async (id: string, body: Record<string, unknown>, successMessage: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setReviews(prev => prev.map(r => (r.id === id ? data : r)));
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete the review from ${name}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setDraft({
      author_name: review.author_name,
      body: review.body,
      rating: review.rating,
      source: review.source,
      source_url: review.source_url ?? '',
      reviewed_on: review.reviewed_on,
      display_order: review.display_order ?? '',
      status: review.status,
    });
    setShowForm(true);
  };

  const submitDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const editing = Boolean(editingId);
      const res = await fetch(editing ? `/api/admin/reviews/${editingId}` : '/api/admin/reviews', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setReviews(prev => (editing ? prev.map(r => (r.id === editingId ? data : r)) : [data, ...prev]));
      toast.success(editing ? 'Review updated' : 'Review added');
      setShowForm(false);
      setEditingId(null);
      setDraft(BLANK_DRAFT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const statusBadge = (status: ReviewStatus) => {
    const style =
      status === 'published'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'pending'
          ? 'bg-amber-100 text-amber-900'
          : 'bg-gray-200 text-gray-700';
    return <Badge className={`${style} border-0 text-[11px] font-semibold capitalize`}>{status}</Badge>;
  };

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            Reviews
          </CardTitle>
          <p className="mt-1 text-sm text-gray-500">
            Approve what customers send in, or paste one in from Facebook, Google or Instagram.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setDraft(BLANK_DRAFT);
            setShowForm(v => !v);
          }}
        >
          {showForm && !editingId ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm && !editingId ? 'Cancel' : 'Add review'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {showForm && (
          <form
            onSubmit={submitDraft}
            className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-5 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'Edit review' : 'Add a review from another platform'}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Copy the reviewer&apos;s words across as they wrote them, and keep the original
                date and platform so the card stays truthful.
              </p>
            </div>

            <div>
              <Label htmlFor="rv-name" className="mb-1.5 block font-bold text-gray-900">
                Reviewer name
              </Label>
              <Input
                id="rv-name"
                value={draft.author_name}
                onChange={e => setDraft(d => ({ ...d, author_name: e.target.value }))}
                required
                maxLength={80}
                placeholder="Kasun Perera"
                className="border-gray-200 bg-white text-black"
              />
            </div>

            <div>
              <Label className="mb-1.5 block font-bold text-gray-900">Rating</Label>
              <div className="flex h-9 items-center">
                <StarPicker value={draft.rating} onChange={v => setDraft(d => ({ ...d, rating: v }))} />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="rv-body" className="mb-1.5 block font-bold text-gray-900">
                Review
              </Label>
              <Textarea
                id="rv-body"
                value={draft.body}
                onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                required
                rows={4}
                maxLength={2000}
                placeholder="Paste the review here…"
                className="border-gray-200 bg-white text-black"
              />
              <p className="mt-1 text-xs text-gray-400">{draft.body.length}/2000</p>
            </div>

            <div>
              <Label className="mb-1.5 block font-bold text-gray-900">Came from</Label>
              <Select
                value={draft.source}
                onValueChange={v => setDraft(d => ({ ...d, source: v as ReviewSource }))}
              >
                <SelectTrigger className="border-gray-200 bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_SOURCES.map(s => (
                    <SelectItem key={s} value={s}>
                      {REVIEW_SOURCE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rv-date" className="mb-1.5 block font-bold text-gray-900">
                Original date
              </Label>
              <Input
                id="rv-date"
                type="date"
                value={draft.reviewed_on}
                onChange={e => setDraft(d => ({ ...d, reviewed_on: e.target.value }))}
                className="border-gray-200 bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="rv-url" className="mb-1.5 block font-bold text-gray-900">
                Link to original <span className="font-medium text-gray-400">(optional)</span>
              </Label>
              <Input
                id="rv-url"
                type="url"
                value={draft.source_url}
                onChange={e => setDraft(d => ({ ...d, source_url: e.target.value }))}
                placeholder="https://facebook.com/…"
                className="border-gray-200 bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="rv-order" className="mb-1.5 block font-bold text-gray-900">
                Position <span className="font-medium text-gray-400">(optional)</span>
              </Label>
              <Input
                id="rv-order"
                type="number"
                min={1}
                value={draft.display_order}
                onChange={e => setDraft(d => ({ ...d, display_order: e.target.value }))}
                placeholder="Lower shows first"
                className="border-gray-200 bg-white text-black"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setDraft(BLANK_DRAFT);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              <span className="ml-1.5 opacity-70">{counts[t.value]}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-14 text-center">
            <MessageSquareQuote className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-semibold text-gray-900">
              {tab === 'pending' ? 'Nothing waiting for you' : `No ${tab} reviews`}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tab === 'pending'
                ? 'Submissions from the storefront land here first.'
                : 'Use “Add review” to bring one across from another platform.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
            {visible.map(review => (
              <li key={review.id} className="p-4 transition-colors hover:bg-gray-50/70 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900">{review.author_name}</span>
                      <StarPicker value={review.rating} size="sm" />
                      {statusBadge(review.status)}
                      <Badge variant="outline" className="border-gray-300 text-[11px] text-gray-600">
                        {REVIEW_SOURCE_LABEL[review.source]}
                      </Badge>
                    </div>
                    <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-gray-700">
                      {review.body}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {review.reviewed_on}
                      {review.display_order != null && ` · position ${review.display_order}`}
                      {review.submitter_email && ` · ${review.submitter_email}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {review.status !== 'published' && (
                      <Button
                        size="sm"
                        disabled={busyId === review.id}
                        onClick={() => patch(review.id, { status: 'published' }, 'Published')}
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                    {review.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === review.id}
                        onClick={() => patch(review.id, { status: 'hidden' }, 'Hidden')}
                      >
                        <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                        Hide
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => startEdit(review)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={busyId === review.id}
                      onClick={() => remove(review.id, review.author_name)}
                      aria-label={`Delete review from ${review.author_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
