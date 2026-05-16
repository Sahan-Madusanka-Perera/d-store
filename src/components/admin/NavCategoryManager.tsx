'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Save, Sparkles, BookOpen, Shirt, Package, ShoppingBag, ChevronDown, ChevronRight } from 'lucide-react';
import type { NavCategory, NavDropdownItem } from '@/types/navigation';

const ICON_OPTIONS = [
  { name: 'Sparkles', component: Sparkles },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Shirt', component: Shirt },
  { name: 'Package', component: Package },
  { name: 'ShoppingBag', component: ShoppingBag },
];

export default function NavCategoryManager() {
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newItemInputs, setNewItemInputs] = useState<Record<number, string>>({});

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/nav-categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    const res = await fetch('/api/admin/nav-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newCategoryLabel.trim() }),
    });
    if (res.ok) {
      setNewCategoryLabel('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category and all its dropdown items?')) return;
    await fetch(`/api/admin/nav-categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const addDropdownItem = async (categoryId: number) => {
    const label = newItemInputs[categoryId]?.trim();
    if (!label) return;
    const res = await fetch('/api/admin/nav-dropdown-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: categoryId, label }),
    });
    if (res.ok) {
      setNewItemInputs(prev => ({ ...prev, [categoryId]: '' }));
      fetchCategories();
    }
  };

  const deleteDropdownItem = async (id: number) => {
    await fetch(`/api/admin/nav-dropdown-items/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.name === iconName);
    if (found) {
      const Icon = found.component;
      return <Icon className="h-4 w-4" />;
    }
    return <ShoppingBag className="h-4 w-4" />;
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading navigation categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add new category */}
      <div className="flex gap-3">
        <Input
          placeholder="New category name (e.g. Accessories)"
          value={newCategoryLabel}
          onChange={(e) => setNewCategoryLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          className="flex-1"
        />
        <Button onClick={addCategory} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories list */}
      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No categories yet. Add your first category above.</p>
        )}
        {categories.map((cat) => (
          <Card key={cat.id} className="border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/10 border-b border-border/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded[cat.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <span className="text-muted-foreground">{getIcon(cat.icon_name)}</span>
                <span className="font-semibold text-base">{cat.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {cat.dropdown_items?.length || 0} items
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {expanded[cat.id] && (
              <CardContent className="p-4 space-y-3">
                {/* Existing dropdown items */}
                {cat.dropdown_items && cat.dropdown_items.length > 0 ? (
                  <div className="space-y-1.5">
                    {cat.dropdown_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground/60">{item.href}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteDropdownItem(item.id)} className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No dropdown items</p>
                )}

                {/* Add dropdown item */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="New item name (e.g. Statues)"
                    value={newItemInputs[cat.id] || ''}
                    onChange={(e) => setNewItemInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addDropdownItem(cat.id)}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addDropdownItem(cat.id)} className="h-9 gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
