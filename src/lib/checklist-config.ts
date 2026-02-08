import type { StepConfig } from './types';

export const TRADING_CONFIG = {
  INSTRUMENT: 'NASDAQ (NQ)',
  SESSION: 'Nueva York',
  WINDOW_START: '09:30',
  WINDOW_END: '10:15',
  TIMEZONE: 'America/New_York',
} as const;

export const STEPS: StepConfig[] = [
  { id: 'preparacion', name: 'Preparación Mental', items: 3 },
  { id: 'mensual', name: 'Análisis Mensual', items: 2 },
  { id: 'semanal', name: 'Análisis Semanal', items: 3 },
  { id: 'diario', name: 'Análisis Diario', items: 4 },
  { id: 'h4', name: 'Análisis 4H', items: 2 },
  { id: 'h1', name: 'Análisis 1H', items: 3 },
  { id: 'entrada', name: 'Modelo Entrada', items: 1 },
  { id: 'registro', name: 'Registro Trade', items: 0 },
];

export const STEP_LABELS = [
  'Prep.', 'Mensual', 'Semanal', 'Diario', '4H', '1H', 'Entrada', 'Registro'
];

export const WIZARD_STEPS_DATA = [
  {
    id: 'preparacion',
    title: 'El Poder de la Espera',
    subtitle: 'Preparación mental antes de operar',
    icon: 'brain',
    items: [
      { label: 'Limpiar y ordenar el espacio de trabajo', hint: 'Una acción sencilla incrementa 94% la probabilidad de éxito en tu ejecución' },
      { label: 'Activar aromaterapia (difusor o incienso)', hint: 'Científicamente comprobado que mejora el enfoque durante la sesión' },
      { label: 'Revisar objetivo del día', hint: 'Ser la mejor trader ejecutando el sistema Edgecore' },
    ],
    quote: { text: '"Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa de la herencia, porque a Cristo el Señor servís."', ref: 'Colosenses 3:23-24' },
    alert: { type: 'warning' as const, text: 'PROHIBIDO DUDAR' },
  },
  {
    id: 'mensual',
    title: 'Análisis Mensual',
    subtitle: 'Revisar solo una vez al mes, al inicio',
    icon: 'calendar',
    items: [
      { label: 'Marcar máximos mensuales' },
      { label: 'Marcar mínimos mensuales' },
    ],
    info: 'Este análisis se hace SOLO el primer día del mes. Ignora el resto del mes.',
    alert: { type: 'warning' as const, text: 'IMPORTANTE: En temporalidad mensual NO se marcan zonas. Solo observar contexto.' },
    quote: { text: '"Y el Señor estaba con José, y fue varón próspero."', ref: 'Génesis 39:23' },
  },
  {
    id: 'semanal',
    title: 'Análisis Semanal',
    subtitle: 'Revisar cada lunes',
    icon: 'calendar-range',
    items: [
      { label: 'Revisar calendario de noticias económicas de la semana' },
      { label: 'Marcar máximos semanales' },
      { label: 'Marcar mínimos semanales' },
    ],
    info: 'Este análisis se hace SOLO los lunes al inicio de la semana.',
    alert: { type: 'warning' as const, text: 'PROHIBIDO DUDAR' },
  },
  {
    id: 'diario',
    title: 'Análisis Diario',
    subtitle: 'Revisar cada día - Análisis a las 9:15 AM (NY)',
    icon: 'calendar-check',
    items: [
      { label: 'Revisar calendario de noticias del día' },
      { label: 'Marcar máximos diarios en gráfico' },
      { label: 'Marcar mínimos diarios en gráfico' },
      { label: 'Marcar zonas de interés: FVG, OB, 50OB' },
    ],
    alert: { type: 'critical' as const, text: 'PROHIBIDO DUDAR - Analizar a las 9:15 AM' },
  },
  {
    id: 'h4',
    title: 'Análisis 4 Horas',
    subtitle: 'Refinamiento del análisis',
    icon: 'clock',
    items: [
      { label: 'Verificar confluencias con zonas diarias' },
      { label: 'Marcar zonas de interés 4H: FVG, OB, 50OB' },
    ],
    alert: { type: 'warning' as const, text: 'PROHIBIDO DUDAR' },
  },
  {
    id: 'h1',
    title: 'Análisis 1 Hora',
    subtitle: 'Análisis entre 9:27 - 9:29 AM (NY)',
    icon: 'timer',
    items: [
      { label: 'Verificar confluencias con zonas de diario y H4', hint: '¿Las zonas marcadas en diario y H4 coinciden?' },
      { label: 'Identificar zonas de 1H cercanas al precio actual', hint: '¿Qué zonas de interés hay cerca del precio ahora?' },
      { label: 'Determinar la dirección del precio con la vela de H1 entre las 9:27 y 9:29 hora New York', hint: 'Observar si tiene más mecha por la parte de arriba o por la parte de abajo' },
    ],
    alert: { type: 'critical' as const, text: 'PROHIBIDO DUDAR - Analizar entre 9:27 - 9:29 AM' },
  },
  {
    id: 'entrada',
    title: 'Modelo de Entrada',
    subtitle: 'Confirmación a las 9:30 AM (NY)',
    icon: 'crosshair',
    items: [
      { label: 'Todos los análisis multi-timeframe completos' },
    ],
    alert: { type: 'critical' as const, text: 'VENTANA DE EJECUCIÓN: 9:30 - 10:15 AM (NY)' },
    warning: 'Si NO se cumplen las condiciones entre 9:30 - 10:15 AM, NO hay entrada hoy. Esperar hasta mañana.',
  },
];
