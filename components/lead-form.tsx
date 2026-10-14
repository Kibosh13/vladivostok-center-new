"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { GeneratedIcon } from "@/components/generated-icon";
import { ArrowIcon } from "@/components/premium-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadPayload = { name: string; phone: string; email?: string; message?: string; source?: string; consent: boolean; marketingConsent?: boolean; specialist?: string };

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

export function LeadForm({ compact = false, source = "site", specialistName, marketingReady = false }: { compact?: boolean; source?: string; specialistName?: string; marketingReady?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "submit_consultation_request",
        title: "Запись на консультацию",
        description: "Отправляет в центр «Путь к себе» заявку на консультацию с именем и телефоном клиента.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            phone: { type: "string", minLength: 6 },
            email: { type: "string" },
            message: { type: "string" },
            consent: { type: "boolean", const: true },
          },
          required: ["name", "phone", "consent"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          const raw = input as Partial<LeadPayload>;
          const name = raw.name?.trim() || "";
          const phone = raw.phone?.trim() || "";
          if (name.length < 2 || phone.length < 6) throw new Error("Укажите имя и телефон");
          if (raw.consent !== true) throw new Error("Требуется отдельное согласие на обработку данных");
          const lead = await submitLead({ name, phone, email: raw.email, message: raw.message, source: "webmcp", specialist: specialistName, consent: true });
          return { id: lead?.id, status: "received" };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* unsupported browser */ }
    return () => lifecycle.abort();
  }, [specialistName]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await submitLead({
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        email: String(data.get("email") || "").trim(),
        message: String(data.get("message") || "").trim(),
        source,
        specialist: specialistName,
        consent: data.get("consent") === "on",
        marketingConsent: data.get("marketing-consent") === "on",
      });
      form.reset();
      setState("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку");
      setState("error");
    }
  }

  if (state === "success") {
    return <div className="form-success" role="status"><GeneratedIcon name="utility-success" /><strong>Заявка получена</strong><span>Мы свяжемся с вами и подберём подходящий формат.</span></div>;
  }

  return (
    <form className={compact ? "lead-form compact" : "lead-form"} onSubmit={onSubmit}>
      {specialistName && <div className="booking-form-heading"><span className="section-label">Запись к специалисту</span><h3>{specialistName}</h3><p>Вы можете записаться к выбранному специалисту напрямую или попросить помочь с подбором.</p></div>}
      <fieldset className="booking-fields" disabled={state === "loading"}>
      <Input name="name" aria-label="Имя" placeholder="Ваше имя" required minLength={2} />
      <Input name="phone" aria-label="Телефон" placeholder="Телефон" required minLength={6} />
      {!compact && <Input name="email" type="email" aria-label="Email" placeholder="Email (необязательно)" />}
      {!compact && <Textarea name="message" aria-label="Пожелания ко времени встречи" placeholder="Удобное время встречи — без медицинских и иных чувствительных подробностей" rows={3} />}
      <label className="form-consent"><input name="consent" type="checkbox" required /><span>Даю <Link href="/soglasie-na-obrabotku-dannyh/" target="_blank">согласие на обработку персональных данных</Link> и ознакомлен(а) с <Link href="/privacy/" target="_blank">политикой обработки данных</Link>.</span></label>
      {marketingReady && <label className="form-consent"><input name="marketing-consent" type="checkbox" /><span>Отдельно соглашаюсь на <Link href="/reklamnye-rassylki/" target="_blank">рекламные рассылки</Link> (необязательно).</span></label>}
      <Button className="form-button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Отправляем…" : "Отправить заявку"}<ArrowIcon />
      </Button>
      </fieldset>
      {state === "error" && <p className="form-error" role="alert">{error}</p>}
      <p className="form-note">Администратор согласует с вами формат и время встречи. Отправка заявки не является оплатой или подтверждением заказа.</p>
    </form>
  );
}
