"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadPayload = { name: string; phone: string; email?: string; message?: string; source?: string };

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title?: string;
        description: string;
        inputSchema: object;
        execute: (input: unknown) => Promise<unknown>;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

async function submitLead(payload: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json() as { lead?: { id: number }; error?: string };
  if (!response.ok) throw new Error(result.error || "Не удалось отправить заявку");
  window.dispatchEvent(new CustomEvent("lead:submitted", { detail: result.lead }));
  return result.lead;
}

export function LeadForm({ compact = false, source = "site" }: { compact?: boolean; source?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "submit_consultation_request",
        title: "Записаться на консультацию",
        description: "Отправляет в центр «Путь к себе» заявку на консультацию с именем и телефоном клиента.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            phone: { type: "string", minLength: 6 },
            email: { type: "string" },
            message: { type: "string" },
          },
          required: ["name", "phone"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          const raw = input as Partial<LeadPayload>;
          const name = raw.name?.trim() || "";
          const phone = raw.phone?.trim() || "";
          if (name.length < 2 || phone.length < 6) throw new Error("Укажите имя и телефон");
          const lead = await submitLead({ name, phone, email: raw.email, message: raw.message, source: "webmcp" });
          return { id: lead?.id, status: "received" };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* unsupported browser */ }
    return () => lifecycle.abort();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await submitLead({
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        email: String(data.get("email") || "").trim(),
        message: String(data.get("message") || "").trim(),
        source,
      });
      event.currentTarget.reset();
      setState("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку");
      setState("error");
    }
  }

  if (state === "success") {
    return <div className="form-success" role="status"><CheckCircle2 /><strong>Заявка получена</strong><span>Мы свяжемся с вами и подберём подходящий формат.</span></div>;
  }

  return (
    <form className={compact ? "lead-form compact" : "lead-form"} onSubmit={onSubmit}>
      <Input name="name" aria-label="Имя" placeholder="Ваше имя" required minLength={2} />
      <Input name="phone" aria-label="Телефон" placeholder="Телефон" required minLength={6} />
      {!compact && <Input name="email" type="email" aria-label="Email" placeholder="Email (необязательно)" />}
      {!compact && <Textarea name="message" aria-label="О чём хотите поговорить" placeholder="Коротко опишите ваш запрос" rows={3} />}
      <Button className="form-button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Отправляем…" : "Подобрать специалиста"}<ArrowRight />
      </Button>
      {state === "error" && <p className="form-error" role="alert">{error}</p>}
      <p className="form-note">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.</p>
    </form>
  );
}
