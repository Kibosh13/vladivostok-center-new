export const selectionLabel = "Индивидуальный подбор специалиста";
export const selectionDescription = "Мы пригласим вас на интервью и бесплатно зададим несколько вопросов.";
export const consultationPrice = "от 7 000 ₽";
// The personal number is used only for WhatsApp. Centre phone / Telegram / MAX stay unchanged.
export const whatsappUrl = "https://wa.me/79057853670";
export const whatsappRequest = (message: string) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;
export const resourceTestRequest = whatsappRequest("Здравствуйте! Хочу пройти авторский тест на ресурсность Алёны Савиновой и получить расшифровку.");
// Replace with the client's actual questionnaire URL when provided. Do not invent questions/scoring.
export const resourceTestUrl = "";
export const resourceTestCompletion = "В ближайшее время с вами свяжется специалист с обратной связью.";
