"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Inbox, LayoutGrid, MessageSquareQuote, Pencil, Plus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { ContentItem, ContentType } from "@/lib/content";

type Lead = { id: number; name: string; phone: string; email: string; message: string; source: string; status: string; createdAt: string };
type Grouped = Record<ContentType, ContentItem[]>;

const sections: Array<{ type: ContentType; label: string; icon: typeof UsersRound }> = [
  { type: "specialist", label: "Специалисты", icon: UsersRound },
  { type: "program", label: "Программы", icon: LayoutGrid },
  { type: "event", label: "Мероприятия", icon: CalendarDays },
  { type: "review", label: "Отзывы", icon: MessageSquareQuote },
];

const emptyItem: ContentItem = { id: "", type: "specialist", slug: "", title: "", subtitle: "", body: "", image: "", meta: "{}", sortOrder: 100, published: true };

export function AdminPanel({ initialItems, initialLeads }: { initialItems: Grouped; initialLeads: Lead[] }) {
  const [items, setItems] = useState(initialItems);
  const [leads, setLeads] = useState(initialLeads);
  const [editor, setEditor] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const leadStats = useMemo(() => ({ all: leads.length, fresh: leads.filter((lead) => lead.status === "new").length }), [leads]);

  function openNew(type: ContentType) { setEditor({ ...emptyItem, type }); }
  function openEdit(item: ContentItem) { setEditor({ ...item }); }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content", { method: editor.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(editor) });
      const result = await response.json() as { item?: ContentItem; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "Не удалось сохранить");
      const saved = result.item;
      setItems((current) => ({ ...current, [saved.type]: current[saved.type].some((item) => item.id === saved.id) ? current[saved.type].map((item) => item.id === saved.id ? saved : item) : [...current[saved.type], saved] }));
      setEditor(null);
      toast.success("Изменения сохранены");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ошибка сохранения"); }
    finally { setSaving(false); }
  }

  async function updateLead(id: number, status: string) {
    const previous = leads;
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
    const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setLeads(previous); toast.error("Статус не сохранён"); } else toast.success("Статус заявки обновлён");
  }

  return <>
    <div className="admin-stats"><article><Inbox /><div><strong>{leadStats.fresh}</strong><span>новых заявок</span></div></article><article><UsersRound /><div><strong>{items.specialist.filter((item) => item.published).length}</strong><span>специалистов на сайте</span></div></article><article><LayoutGrid /><div><strong>{items.program.filter((item) => item.published).length}</strong><span>активных программ</span></div></article></div>
    <Tabs defaultValue="specialist" className="admin-tabs">
      <TabsList className="admin-tabs-list">
        {sections.map(({ type, label, icon: Icon }) => <TabsTrigger key={type} value={type}><Icon />{label}</TabsTrigger>)}
        <TabsTrigger value="leads"><Inbox />Заявки <span className="admin-badge">{leadStats.fresh}</span></TabsTrigger>
      </TabsList>
      {sections.map(({ type, label }) => <TabsContent key={type} value={type} className="admin-panel">
        <div className="admin-panel-heading"><div><h2>{label}</h2><p>Контент этого раздела сразу используется на сайте.</p></div><Button onClick={() => openNew(type)}><Plus /> Добавить</Button></div>
        <Table><TableHeader><TableRow><TableHead>Название</TableHead><TableHead>Подзаголовок</TableHead><TableHead>Порядок</TableHead><TableHead>Статус</TableHead><TableHead className="w-24">Действия</TableHead></TableRow></TableHeader><TableBody>
          {items[type].map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.title}</TableCell><TableCell className="max-w-80 truncate text-muted-foreground">{item.subtitle}</TableCell><TableCell>{item.sortOrder}</TableCell><TableCell><span className={item.published ? "status-chip active" : "status-chip"}>{item.published ? "Опубликовано" : "Скрыто"}</span></TableCell><TableCell><Button variant="ghost" size="icon-sm" aria-label={`Редактировать ${item.title}`} onClick={() => openEdit(item)}><Pencil /></Button></TableCell></TableRow>)}
        </TableBody></Table>
      </TabsContent>)}
      <TabsContent value="leads" className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Заявки</h2><p>{leadStats.all ? `Всего ${leadStats.all}, новых ${leadStats.fresh}.` : "Новые заявки с форм сайта появятся здесь."}</p></div></div>
        <Table><TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>Клиент</TableHead><TableHead>Контакты</TableHead><TableHead>Запрос</TableHead><TableHead>Статус</TableHead></TableRow></TableHeader><TableBody>
          {leads.map((lead) => <TableRow key={lead.id}><TableCell>{new Date(lead.createdAt).toLocaleDateString("ru-RU")}</TableCell><TableCell className="font-medium">{lead.name}</TableCell><TableCell><a href={`tel:${lead.phone}`}>{lead.phone}</a>{lead.email && <><br /><a href={`mailto:${lead.email}`} className="text-muted-foreground">{lead.email}</a></>}</TableCell><TableCell className="max-w-96 whitespace-normal">{lead.message || <span className="text-muted-foreground">Без комментария</span>}</TableCell><TableCell><NativeSelect value={lead.status} onChange={(event) => updateLead(lead.id, event.target.value)}><NativeSelectOption value="new">Новая</NativeSelectOption><NativeSelectOption value="contacted">Связались</NativeSelectOption><NativeSelectOption value="completed">Завершена</NativeSelectOption><NativeSelectOption value="archived">Архив</NativeSelectOption></NativeSelect></TableCell></TableRow>)}
        </TableBody></Table>
      </TabsContent>
    </Tabs>

    <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && setEditor(null)}>
      <DialogContent className="admin-dialog sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editor?.id ? "Редактировать" : "Добавить материал"}</DialogTitle><DialogDescription>Текст и изображение будут показаны в соответствующем разделе сайта.</DialogDescription></DialogHeader>
        {editor && <form onSubmit={saveItem} className="admin-form">
          <div><Label htmlFor="title">Название</Label><Input id="title" value={editor.title} required onChange={(event) => setEditor({ ...editor, title: event.target.value })} /></div>
          <div><Label htmlFor="subtitle">Подзаголовок / дата / формат</Label><Input id="subtitle" value={editor.subtitle} onChange={(event) => setEditor({ ...editor, subtitle: event.target.value })} /></div>
          <div className="full"><Label htmlFor="body">Описание</Label><Textarea id="body" rows={6} value={editor.body} onChange={(event) => setEditor({ ...editor, body: event.target.value })} /></div>
          <div className="full"><Label htmlFor="image">Путь к изображению или URL</Label><Input id="image" value={editor.image} placeholder="/images/photo.jpg" onChange={(event) => setEditor({ ...editor, image: event.target.value })} /></div>
          <div><Label htmlFor="slug">Адрес</Label><Input id="slug" value={editor.slug} onChange={(event) => setEditor({ ...editor, slug: event.target.value })} /></div>
          <div><Label htmlFor="order">Порядок</Label><Input id="order" type="number" value={editor.sortOrder} onChange={(event) => setEditor({ ...editor, sortOrder: Number(event.target.value) })} /></div>
          <label className="publish-check"><Checkbox checked={editor.published} onCheckedChange={(checked) => setEditor({ ...editor, published: checked === true })} />Показывать на сайте</label>
          <DialogFooter className="full"><Button type="button" variant="outline" onClick={() => setEditor(null)}>Отмена</Button><Button type="submit" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить"}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
    <Toaster richColors position="bottom-right" />
  </>;
}
