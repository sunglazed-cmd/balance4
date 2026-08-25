# Баланс — трекер калорий (TypeScript + нативная Android-обёртка)

Android-приложение: веб-интерфейс на **TypeScript**, упакованный через Capacitor, плюс
собственный нативный плагин на Java, который даёт то, чего не может обычный веб:
**шагомер, работающий в фоне** — при выключенном экране, свёрнутом или закрытом приложении,
с автоматическим возобновлением после перезагрузки телефона.

## Структура

```
src/app.ts        ← весь код приложения (TypeScript, единственный исходник)
src/native.d.ts   ← типы моста к нативному плагину (window.Capacitor.Plugins.Pedometer)
tsconfig.json     ← настройки компилятора
www/              ← то, что реально попадает в APK
  index.html      ←   разметка и стили (правится руками)
  app.js          ←   СОБИРАЕТСЯ из src/app.ts, руками не править
  app.js.map      ←   source map: в отладчике видно строки .ts, а не скомпилированный .js
android/          ← нативный Android-проект
  app/src/main/java/com/balance/calorietracker/
    StepCounterService.java  ← foreground-сервис, читает датчик Sensor.TYPE_STEP_COUNTER
    PedometerPlugin.java     ← мост между JS и сервисом
    BootReceiver.java        ← перезапуск шагомера после перезагрузки телефона
    MainActivity.java        ← регистрирует плагин
```

`www/app.js` — результат сборки, но он **намеренно лежит в репозитории**: Capacitor кладёт
папку `www/` в APK как есть, и без собранного файла приложение открылось бы пустым экраном.
После правки `src/app.ts` нужно пересобрать (`npm run build`) и закоммитить обновлённый `app.js`.

## Команды

```
npm install        # один раз — зависимости Capacitor и TypeScript
npm run build      # src/app.ts  →  www/app.js
npm run typecheck  # только проверка типов, без записи файлов
npm run watch      # пересборка на каждое сохранение (удобно во время правок)
npm run sync       # build + npx cap sync android (копирует www/ в android-проект)
```

## Как получить APK

### Вариант 1 — GitHub (проще всего, ничего ставить не нужно)

Push в `main` запускает workflow `.github/workflows/build-android.yml`, который проверяет
типы, собирает TypeScript и делает APK на сервере GitHub.

1. Actions → последний прогон → внизу блок **Artifacts** → `balance-app-debug-apk`.
2. Скачивается zip, внутри `app-debug.apk` — его можно сразу отправить на телефон.

Собрать без коммита: Actions → **Build Android APK** → **Run workflow**.

### Вариант 2 — Android Studio (нужен, если хочешь ставить на телефон по USB и смотреть логи)

1. `npm install` и `npm run build` в корне проекта — **до** открытия Android Studio
   (иначе Gradle нечего будет класть в APK).
2. Android Studio → **Open** → выбрать папку `android/` (именно её, не корень).
3. Дождаться первой синхронизации Gradle.
4. **Run ▶** на подключённом телефоне (Настройки → Для разработчиков → Отладка по USB),
   либо **Build → Build App Bundle(s) / APK(s) → Build APK(s)** для файла без USB.

Готовый файл: `android/app/build/outputs/apk/debug/app-debug.apk`.

### Требования к версиям (из-за них чаще всего и падает первая сборка)

| Что | Версия | Почему именно она |
|---|---|---|
| JDK | **21 и новее** | Capacitor 8 генерирует `capacitor.build.gradle` с `JavaVersion.VERSION_21`; на JDK 17 сборка падает на компиляции |
| Gradle | **9.5** | Android Studio приносит с собой JBR 25, а Gradle 8.x на нём не запускается вовсе (`Unsupported class file major version 69`) |
| Android SDK | API 36 | `compileSdk`/`targetSdk` в `android/variables.gradle`; Studio предложит доустановить |
| Node.js | 20+ | для TypeScript и Capacitor CLI |

Android Studio использует свой JDK (Settings → Build → Build Tools → Gradle → Gradle JDK) —
там должен стоять встроенный JBR или любой JDK 21+.

## Разрешения, которые попросит приложение

- **Физическая активность** (Activity Recognition) — обязательно для чтения датчика шагов на Android 10+
- **Уведомления** — обязательно на Android 13+: без постоянного уведомления
  «Баланс — считаем шаги» Android не даёт фоновому сервису долго жить

## Как считаются шаги

`StepCounterService` слушает сразу два датчика:

- `TYPE_STEP_COUNTER` — накопительный счётчик с момента загрузки телефона, источник истины;
- `TYPE_STEP_DETECTOR` — по одному событию на шаг, без буферизации, чтобы число в шторке
  росло сразу, а не рывками.

Оба зарегистрированы с `maxReportLatencyUs = 0` — это запрещает сенсорному хабу копить
события пачками (именно из-за накопления счётчик в шторке отставал). Уведомление
перерисовывается не чаще раза в секунду, шаги, уже зачтённые детектором, вычитаются из
следующей порции счётчика, поэтому двойного счёта не возникает.

## Если что-то не собирается

- `Unsupported class file major version` — Gradle старее проекта: проверь
  `android/gradle/wrapper/gradle-wrapper.properties`, там должно быть `gradle-9.5.0-all.zip`.
- `invalid source release: 21` — сборка идёт на JDK 17, смени Gradle JDK на 21+.
- Приложение открывается пустым экраном — не собран `www/app.js`: `npm run build`.
- `SDK location not found` — Android Studio создаст `android/local.properties` сам при
  первом открытии; путь в нём пишется через прямые слэши.
