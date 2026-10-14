export const selectionLabel = "Индивидуальный подбор специалиста";
export const selectionDescription = "Индивидуальный подбор психолога под запрос клиента. Пригласим в пространство центра и за чашкой кофе поможем определиться с запросом и выбором специалиста. Услуга комплиментарна.";
export const consultationPrice = "от 7 000 ₽";
// The personal number is used only for WhatsApp. Centre phone and Telegram stay unchanged.
export const whatsappUrl = "https://wa.me/79057853670";
export const whatsappRequest = (message: string) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;
export const resourceTestRequest = whatsappRequest("Здравствуйте! Хочу пройти авторский тест на ресурсность Алёны Савиновой и получить расшифровку.");
// Replace with the client's actual questionnaire URL when provided. Do not invent questions/scoring.
export const resourceTestUrl = "";
export const resourceTestCompletion = "Расшифровку теста для вас сделает лично Алёна Савинова.";
