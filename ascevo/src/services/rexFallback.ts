/**
 * Rex Fallback Service
 * Pre-written responses returned when OpenAI is unavailable or rate-limited.
 * All 8 supported languages are covered for each response type.
 */

import type { SupportedLanguage } from './i18nService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RexResponseType = 'checkin_success' | 'checkin_fail' | 'streak_warning' | 'weekly_summary';

// ---------------------------------------------------------------------------
// Fallback response maps — keyed by language
// ---------------------------------------------------------------------------

const CHECKIN_SUCCESS: Record<SupportedLanguage, string[]> = {
  en: [
    "Streak intact. Don't act surprised — you knew you had it in you.",
    "Done. Now do it again tomorrow and it actually starts to mean something.",
    "That's the job. See you tomorrow.",
    "Good. Most people quit before day [streakDays]. You're still here.",
    "Completed. Rex acknowledges this. Rex expects more next week.",
  ],
  ro: [
    "Streak intact. Nu te preface surprins — știai că ai asta în tine.",
    "Gata. Acum fă-o din nou mâine și începe să conteze cu adevărat.",
    "Ăsta e jobul. Ne vedem mâine.",
    "Bine. Majoritatea renunță înainte de ziua [streakDays]. Tu ești încă aici.",
    "Completat. Rex recunoaște asta. Rex se așteaptă la mai mult săptămâna viitoare.",
  ],
  it: [
    "Streak intatto. Non fare finta di sorprenderti — sapevi di avercela.",
    "Fatto. Ora rifallo domani e inizia davvero a significare qualcosa.",
    "Questo è il lavoro. A domani.",
    "Bene. La maggior parte delle persone molla prima del giorno [streakDays]. Tu sei ancora qui.",
    "Completato. Rex lo riconosce. Rex si aspetta di più la prossima settimana.",
  ],
  fr: [
    "Série intacte. Ne fais pas semblant d'être surpris — tu savais que tu en étais capable.",
    "Fait. Maintenant refais-le demain et ça commence vraiment à avoir du sens.",
    "C'est le boulot. À demain.",
    "Bien. La plupart des gens abandonnent avant le jour [streakDays]. Tu es encore là.",
    "Complété. Rex le reconnaît. Rex attend plus la semaine prochaine.",
  ],
  de: [
    "Streak intakt. Tu nicht so überrascht — du wusstest, dass du es drauf hast.",
    "Erledigt. Mach es morgen wieder und es fängt an, wirklich etwas zu bedeuten.",
    "Das ist der Job. Bis morgen.",
    "Gut. Die meisten geben vor Tag [streakDays] auf. Du bist noch hier.",
    "Abgeschlossen. Rex erkennt das an. Rex erwartet nächste Woche mehr.",
  ],
  es: [
    "Racha intacta. No finjas sorpresa — sabías que lo tenías en ti.",
    "Hecho. Ahora hazlo de nuevo mañana y empieza a significar algo de verdad.",
    "Ese es el trabajo. Hasta mañana.",
    "Bien. La mayoría de la gente se rinde antes del día [streakDays]. Tú sigues aquí.",
    "Completado. Rex lo reconoce. Rex espera más la próxima semana.",
  ],
  pt: [
    "Sequência intacta. Não finjas surpresa — sabias que tinhas isso em ti.",
    "Feito. Agora faz de novo amanhã e começa a significar algo de verdade.",
    "Esse é o trabalho. Até amanhã.",
    "Bem. A maioria das pessoas desiste antes do dia [streakDays]. Tu ainda estás aqui.",
    "Concluído. Rex reconhece isso. Rex espera mais na próxima semana.",
  ],
  nl: [
    "Streak intact. Doe niet alsof je verrast bent — je wist dat je het in je had.",
    "Klaar. Doe het morgen opnieuw en het begint echt iets te betekenen.",
    "Dat is het werk. Tot morgen.",
    "Goed. De meeste mensen stoppen voor dag [streakDays]. Jij bent er nog.",
    "Voltooid. Rex erkent dit. Rex verwacht meer volgende week.",
  ],
};

const CHECKIN_FAIL: Record<SupportedLanguage, string[]> = {
  en: [
    "Didn't happen today. Fine. But we both know why, don't we.",
    "Missed it. Tomorrow the challenge stays the same until you do it.",
    "Skip once, it's a bad day. Skip twice, it's a habit. Don't skip twice.",
    "You had time. We both know that. See you tomorrow.",
    "Not done. Your streak is [streakDays] days. Don't let tonight define it.",
  ],
  ro: [
    "Nu s-a întâmplat azi. Bine. Dar amândoi știm de ce, nu-i așa.",
    "Ratat. Mâine provocarea rămâne aceeași până o faci.",
    "Sari o dată, e o zi proastă. Sari de două ori, e un obicei. Nu sări de două ori.",
    "Ai avut timp. Amândoi știm asta. Ne vedem mâine.",
    "Nefăcut. Streak-ul tău e de [streakDays] zile. Nu lăsa seara asta să-l definească.",
  ],
  it: [
    "Non è successo oggi. Va bene. Ma sappiamo entrambi perché, vero.",
    "Mancato. Domani la sfida rimane la stessa finché non la fai.",
    "Salta una volta, è una brutta giornata. Salta due volte, è un'abitudine. Non saltare due volte.",
    "Avevi tempo. Lo sappiamo entrambi. A domani.",
    "Non fatto. Il tuo streak è di [streakDays] giorni. Non lasciare che questa sera lo definisca.",
  ],
  fr: [
    "Ça n'a pas eu lieu aujourd'hui. Bien. Mais on sait tous les deux pourquoi, n'est-ce pas.",
    "Raté. Demain le défi reste le même jusqu'à ce que tu le fasses.",
    "Sauter une fois, c'est une mauvaise journée. Sauter deux fois, c'est une habitude. Ne saute pas deux fois.",
    "Tu avais le temps. On le sait tous les deux. À demain.",
    "Pas fait. Ta série est de [streakDays] jours. Ne laisse pas ce soir la définir.",
  ],
  de: [
    "Heute nicht passiert. Gut. Aber wir beide wissen warum, oder.",
    "Verpasst. Morgen bleibt die Aufgabe dieselbe, bis du sie erledigst.",
    "Einmal überspringen ist ein schlechter Tag. Zweimal überspringen ist eine Gewohnheit. Überspring nicht zweimal.",
    "Du hattest Zeit. Wir beide wissen das. Bis morgen.",
    "Nicht erledigt. Dein Streak ist [streakDays] Tage. Lass heute Abend ihn nicht definieren.",
  ],
  es: [
    "No pasó hoy. Bien. Pero los dos sabemos por qué, ¿verdad?",
    "Fallado. Mañana el desafío sigue igual hasta que lo hagas.",
    "Saltarlo una vez es un mal día. Saltarlo dos veces es un hábito. No lo saltes dos veces.",
    "Tenías tiempo. Los dos lo sabemos. Hasta mañana.",
    "No hecho. Tu racha es de [streakDays] días. No dejes que esta noche la defina.",
  ],
  pt: [
    "Não aconteceu hoje. Tudo bem. Mas os dois sabemos porquê, não é.",
    "Falhado. Amanhã o desafio fica igual até o fazeres.",
    "Saltar uma vez é um mau dia. Saltar duas vezes é um hábito. Não saltes duas vezes.",
    "Tinhas tempo. Os dois sabemos isso. Até amanhã.",
    "Não feito. A tua sequência é de [streakDays] dias. Não deixes esta noite defini-la.",
  ],
  nl: [
    "Vandaag niet gebeurd. Prima. Maar we weten allebei waarom, toch.",
    "Gemist. Morgen blijft de uitdaging hetzelfde totdat je het doet.",
    "Eén keer overslaan is een slechte dag. Twee keer overslaan is een gewoonte. Sla niet twee keer over.",
    "Je had tijd. We weten dat allebei. Tot morgen.",
    "Niet gedaan. Je streak is [streakDays] dagen. Laat vanavond het niet definiëren.",
  ],
};

const STREAK_WARNING: Record<SupportedLanguage, string[]> = {
  en: [
    "Your [streakDays]-day streak dies in [hoursLeft] hours. Just saying.",
    "[hoursLeft] hours left. [streakDays] days on the line. Your call.",
    "Rex doesn't beg. But [streakDays] days is [streakDays] days.",
  ],
  ro: [
    "Streak-ul tău de [streakDays] zile moare în [hoursLeft] ore. Doar zic.",
    "Mai sunt [hoursLeft] ore. [streakDays] zile în joc. Decizia ta.",
    "Rex nu se roagă. Dar [streakDays] zile sunt [streakDays] zile.",
  ],
  it: [
    "Il tuo streak di [streakDays] giorni muore in [hoursLeft] ore. Lo dico solo.",
    "[hoursLeft] ore rimaste. [streakDays] giorni in gioco. Decidi tu.",
    "Rex non supplica. Ma [streakDays] giorni sono [streakDays] giorni.",
  ],
  fr: [
    "Ta série de [streakDays] jours meurt dans [hoursLeft] heures. Je dis ça, je dis rien.",
    "[hoursLeft] heures restantes. [streakDays] jours en jeu. C'est ton choix.",
    "Rex ne supplie pas. Mais [streakDays] jours c'est [streakDays] jours.",
  ],
  de: [
    "Dein [streakDays]-Tage-Streak stirbt in [hoursLeft] Stunden. Nur so.",
    "Noch [hoursLeft] Stunden. [streakDays] Tage auf dem Spiel. Deine Entscheidung.",
    "Rex bettelt nicht. Aber [streakDays] Tage sind [streakDays] Tage.",
  ],
  es: [
    "Tu racha de [streakDays] días muere en [hoursLeft] horas. Solo lo digo.",
    "[hoursLeft] horas restantes. [streakDays] días en juego. Tú decides.",
    "Rex no suplica. Pero [streakDays] días son [streakDays] días.",
  ],
  pt: [
    "A tua sequência de [streakDays] dias morre em [hoursLeft] horas. Só a dizer.",
    "[hoursLeft] horas restantes. [streakDays] dias em jogo. A tua decisão.",
    "Rex não implora. Mas [streakDays] dias são [streakDays] dias.",
  ],
  nl: [
    "Je [streakDays]-daagse streak sterft over [hoursLeft] uur. Zeg ik maar.",
    "[hoursLeft] uur over. [streakDays] dagen op het spel. Jouw keuze.",
    "Rex smeekt niet. Maar [streakDays] dagen zijn [streakDays] dagen.",
  ],
};

const WEEKLY_SUMMARY: Record<SupportedLanguage, string[]> = {
  en: [
    "Rex couldn't load your summary. But you know what you did this week.",
    "Summary unavailable. You know if it was a good week or not.",
    "No summary right now. Show up tomorrow and make it irrelevant.",
  ],
  ro: [
    "Rex nu a putut încărca rezumatul tău. Dar știi ce ai făcut săptămâna asta.",
    "Rezumat indisponibil. Știi dacă a fost o săptămână bună sau nu.",
    "Niciun rezumat acum. Apari mâine și fă-l irelevant.",
  ],
  it: [
    "Rex non ha potuto caricare il tuo riepilogo. Ma sai cosa hai fatto questa settimana.",
    "Riepilogo non disponibile. Sai se è stata una buona settimana o no.",
    "Nessun riepilogo adesso. Presentati domani e rendilo irrilevante.",
  ],
  fr: [
    "Rex n'a pas pu charger ton résumé. Mais tu sais ce que tu as fait cette semaine.",
    "Résumé indisponible. Tu sais si c'était une bonne semaine ou non.",
    "Pas de résumé pour l'instant. Présente-toi demain et rends-le sans importance.",
  ],
  de: [
    "Rex konnte deine Zusammenfassung nicht laden. Aber du weißt, was du diese Woche getan hast.",
    "Zusammenfassung nicht verfügbar. Du weißt, ob es eine gute Woche war oder nicht.",
    "Keine Zusammenfassung gerade. Erschein morgen und mach sie irrelevant.",
  ],
  es: [
    "Rex no pudo cargar tu resumen. Pero sabes lo que hiciste esta semana.",
    "Resumen no disponible. Sabes si fue una buena semana o no.",
    "Sin resumen ahora mismo. Preséntate mañana y hazlo irrelevante.",
  ],
  pt: [
    "Rex não conseguiu carregar o teu resumo. Mas sabes o que fizeste esta semana.",
    "Resumo indisponível. Sabes se foi uma boa semana ou não.",
    "Sem resumo agora. Aparece amanhã e torna-o irrelevante.",
  ],
  nl: [
    "Rex kon je samenvatting niet laden. Maar je weet wat je deze week hebt gedaan.",
    "Samenvatting niet beschikbaar. Je weet of het een goede week was of niet.",
    "Geen samenvatting nu. Kom morgen opdagen en maak het irrelevant.",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

function substitute(template: string, streakDays: number, hoursLeft?: number): string {
  let result = template.replace(/\[streakDays\]/g, String(streakDays));
  if (hoursLeft !== undefined) {
    result = result.replace(/\[hoursLeft\]/g, String(hoursLeft));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a fallback response for any response type and language.
 * Always returns a non-empty string.
 */
export function getFallbackResponse(
  type: RexResponseType,
  language: SupportedLanguage,
  streakDays = 0,
  hoursLeft?: number
): string {
  const map: Record<RexResponseType, Record<SupportedLanguage, string[]>> = {
    checkin_success: CHECKIN_SUCCESS,
    checkin_fail: CHECKIN_FAIL,
    streak_warning: STREAK_WARNING,
    weekly_summary: WEEKLY_SUMMARY,
  };

  const pool = map[type][language] ?? map[type]['en'];
  return substitute(pickRandom(pool), streakDays, hoursLeft);
}

// Legacy API — kept for backwards compatibility with existing callers

export function getCheckInFallback(
  completed: boolean,
  streakDays: number,
  language: SupportedLanguage = 'en'
): string {
  return getFallbackResponse(
    completed ? 'checkin_success' : 'checkin_fail',
    language,
    streakDays
  );
}

export function getStreakWarningFallback(
  streakDays: number,
  hoursLeft: number,
  language: SupportedLanguage = 'en'
): string {
  return getFallbackResponse('streak_warning', language, streakDays, hoursLeft);
}

export function getWeeklySummaryFallback(language: SupportedLanguage = 'en'): string {
  return getFallbackResponse('weekly_summary', language);
}
