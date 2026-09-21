import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getContent } from "@/lib/content.server";
import { getDb } from "@/db";
import { leads as leadsTable } from "@/db/schema";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const [specialists, programs, events, reviews] = await Promise.all([
    getContent("specialist", true), getContent("program", true), getContent("event", true), getContent("review", true),
  ]);
  let leads: Array<{ id: number; name: string; phone: string; email: string; message: string; source: string; status: string; createdAt: string }> = [];
  try { leads = await getDb().select().from(leadsTable).orderBy(desc(leadsTable.createdAt)).limit(250); } catch { /* first local run before migration */ }

  return <main className="admin-page">
    <header className="admin-header">
      <div><span className="admin-kicker">ПУТЬ К СЕБЕ · CMS</span><h1>Управление сайтом</h1></div>
      <nav><Link href="/"><ArrowLeft /> На сайт</Link><a href="/" target="_blank">Открыть <ExternalLink /></a><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")}>Выйти</a></nav>
    </header>
    <AdminPanel initialItems={{ specialist: specialists, program: programs, event: events, review: reviews }} initialLeads={leads} />
  </main>;
}
