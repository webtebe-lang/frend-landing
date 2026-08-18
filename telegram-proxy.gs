// Google Apps Script для безопасной отправки заявок в Telegram
//
// ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
//
// 1. Откройте https://script.google.com/
// 2. Создайте новый проект (New Project)
// 3. Скопируйте этот код в редактор
// 4. Настройте константы ниже (токен бота и chat ID)
// 5. Нажмите Deploy → New deployment
// 6. Выберите тип: Web app
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. Скопируйте URL веб-приложения
// 10. Вставьте этот URL в index.html в переменную FORM_SUBMIT_URL

// ====== НАСТРОЙТЕ ЭТИ ЗНАЧЕНИЯ ======
const TG_BOT_TOKEN = "ВСТАВЬТЕ_ТОКЕН_БОТА_СЮДА";
const TG_CHAT_ID = "ВСТАВЬТЕ_CHAT_ID_СЮДА";
// ====================================

function doPost(e) {
  try {
    // Проверка наличия данных
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No data"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Парсинг данных
    const data = JSON.parse(e.postData.contents);
    const name = (data.name || "").toString().trim();
    const phone = (data.phone || "").toString().trim();
    const model = (data.model || "").toString().trim();

    // Базовая валидация
    if (!name || !phone) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Name and phone required"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ограничение длины для защиты от спама
    if (name.length > 100 || phone.length > 50 || model.length > 200) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Data too long"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Формирование сообщения
    const message =
      "🔔 Новая заявка с сайта\n\n" +
      "👤 Имя: " + name + "\n" +
      "📞 Телефон: " + phone + "\n" +
      "📦 Модель: " + model + "\n\n" +
      "⏰ " + new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

    // Отправка в Telegram
    const telegramUrl = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage";
    const payload = {
      chat_id: TG_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(telegramUrl, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      Logger.log("Telegram API error: " + response.getContentText());
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Send failed"
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Server error"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Тестовая функция для проверки настройки
function testTelegramConnection() {
  const testMessage = "✅ Тест подключения: скрипт настроен правильно!";
  const telegramUrl = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage";
  const payload = {
    chat_id: TG_CHAT_ID,
    text: testMessage
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(telegramUrl, options);
  Logger.log("Test response: " + response.getContentText());
}
