import { useState, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Brain, Calendar, CalendarRange,
  CalendarCheck, Clock, Timer, Crosshair, Pen, AlertTriangle, Info, CircleAlert, Quote, CheckCircle, XCircle
} from 'lucide-react';
import { WIZARD_STEPS_DATA, STEP_LABELS, STEPS } from '@/lib/checklist-config';
import {
  getTodayChecklist, saveTodayChecklist, createEmptyChecklist,
  formatDateDisplay, getNYTime, formatDateKey
} from '@/lib/storage';
import type { ChecklistData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const stepIcons = [Brain, Calendar, CalendarRange, CalendarCheck, Clock, Timer, Crosshair, Pen];

export default function ChecklistWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ChecklistData>(() => getTodayChecklist());
  const { toast } = useToast();
  const totalSteps = 8;
  const todayDisplay = formatDateDisplay(formatDateKey(getNYTime()));

  const updateChecklist = useCallback((stepId: string, itemIdx: number, checked: boolean) => {
    setData(prev => {
      const next = { ...prev, checklist: { ...prev.checklist } };
      next.checklist[stepId] = [...(next.checklist[stepId] || [])];
      next.checklist[stepId][itemIdx] = checked;
      return next;
    });
  }, []);

  const handleTradeDecision = (hadEntry: boolean) => {
    setData(prev => ({ ...prev, hadEntry }));
  };

  const handleFvgSelect = (count: number) => {
    setData(prev => ({
      ...prev,
      tradeData: { fvgCount: count, notes: prev.tradeData?.notes || '', result: null, points: null },
    }));
  };

  const handleFinish = () => {
    if (data.hadEntry === undefined) {
      toast({ title: 'Indica si hubo entrada hoy (SÍ o NO)', variant: 'destructive' });
      return;
    }
    if (data.hadEntry && !data.tradeData?.fvgCount) {
      toast({ title: 'Selecciona el número de FVG identificados', variant: 'destructive' });
      return;
    }
    saveTodayChecklist(data);
    toast({ title: '✅ Checklist guardado exitosamente' });
    setTimeout(() => {
      setData(createEmptyChecklist());
      setCurrentStep(1);
    }, 800);
  };

  const renderAlertBox = (type: 'warning' | 'critical' | 'info', text: string) => {
    const styles = {
      warning: 'border-primary/50 bg-primary/10',
      critical: 'border-destructive/50 bg-destructive/10',
      info: 'border-accent/50 bg-accent/10',
    };
    const icons = { warning: AlertTriangle, critical: CircleAlert, info: Info };
    const iconColors = { warning: 'text-primary', critical: 'text-destructive', info: 'text-accent' };
    const Icon = icons[type];

    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${styles[type]} my-4`}>
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
        <span className="text-sm font-semibold text-foreground">{text}</span>
      </div>
    );
  };

  const renderChecklistStep = (stepIndex: number) => {
    const stepData = WIZARD_STEPS_DATA[stepIndex];
    if (!stepData) return null;

    return (
      <div className="fade-in">
        {stepData.info && renderAlertBox('info', stepData.info)}
        {stepData.alert && renderAlertBox(stepData.alert.type, stepData.alert.text)}

        <div className="space-y-3 my-6">
          {stepData.items.map((item, idx) => (
            <label
              key={idx}
              className="flex items-start gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-secondary transition-colors group"
            >
              <input
                type="checkbox"
                className="custom-checkbox mt-0.5"
                checked={data.checklist[stepData.id]?.[idx] || false}
                onChange={(e) => updateChecklist(stepData.id, idx, e.target.checked)}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                {item.hint && (
                  <span className="block text-xs text-muted-foreground mt-1">{item.hint}</span>
                )}
              </div>
            </label>
          ))}
        </div>

        {stepData.warning && renderAlertBox('warning', stepData.warning)}

        {stepData.quote && (
          <div className="bg-background p-5 rounded-lg border-l-4 border-primary mt-6 italic">
            <Quote className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm text-foreground/90 leading-relaxed">{stepData.quote.text}</p>
            <span className="block text-right text-xs text-primary font-semibold mt-2 not-italic">— {stepData.quote.ref}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStep8 = () => (
    <div className="fade-in">
      <div className="text-center my-8">
        <h3 className="text-lg font-titles font-semibold text-foreground mb-5">¿Hubo entrada hoy?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => handleTradeDecision(true)}
            className={`flex flex-col items-center gap-3 px-8 py-6 rounded-xl border-2 font-titles font-semibold transition-all ${
              data.hadEntry === true
                ? 'border-primary bg-primary/10 text-primary gold-shadow'
                : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
            }`}
          >
            <CheckCircle className="w-10 h-10" />
            <span>SÍ — Ejecuté Trade</span>
          </button>
          <button
            type="button"
            onClick={() => handleTradeDecision(false)}
            className={`flex flex-col items-center gap-3 px-8 py-6 rounded-xl border-2 font-titles font-semibold transition-all ${
              data.hadEntry === false
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-border text-foreground hover:border-destructive hover:bg-destructive/5'
            }`}
          >
            <XCircle className="w-10 h-10" />
            <span>NO — Sin Entrada</span>
          </button>
        </div>
      </div>

      {data.hadEntry === true && (
        <div className="fade-in space-y-6">
          <div>
            <h3 className="text-base font-titles font-semibold text-foreground text-center mb-4">
              Reglas FVG — ¿Cuántos FVG identificaste?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { val: 1, title: '1 FVG', rules: ['Ejecutar en el único FVG', 'SL: Proteger 3 velas del FVG', 'Si no 1:1.2, esperar descuento'] },
                { val: 2, title: '2 FVG', rules: ['Ejecutar en el ÚLTIMO FVG', 'SL: Proteger 3 velas del 1er FVG', 'Si no 1:1.2, descuento o vela envolvente'] },
                { val: 3, title: '3+ FVG', rules: ['Esperar protocolo vela envolvente', 'NO ejecutar sin protocolo'] },
              ].map(fvg => (
                <button
                  key={fvg.val}
                  type="button"
                  onClick={() => handleFvgSelect(fvg.val)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    data.tradeData?.fvgCount === fvg.val
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-accent bg-background'
                  }`}
                >
                  <strong className="text-primary text-sm block mb-2">{fvg.title}</strong>
                  {fvg.rules.map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">→ {r}</p>
                  ))}
                </button>
              ))}
            </div>
          </div>

          {renderAlertBox('warning', 'RECORDATORIO: NO mover el SL (sin break even). Solo TP o SL inicial.')}

          <div>
            <label className="text-sm font-medium text-primary block mb-2">Notas Adicionales</label>
            <textarea
              value={data.tradeData?.notes || ''}
              onChange={(e) => setData(prev => ({
                ...prev,
                tradeData: { ...prev.tradeData!, notes: e.target.value },
              }))}
              rows={3}
              placeholder="Ej: Confluencia perfecta con zona semanal..."
              className="w-full p-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      )}

      {data.hadEntry === false && (
        <div className="fade-in space-y-4">
          <h3 className="text-base font-titles font-semibold text-foreground text-center">¿Por qué no ejecutaste?</h3>
          <div className="space-y-2">
            {['R:R no era mínimo 1:1.2', 'Fuera de ventana 9:30-10:15 AM'].map((reason, idx) => (
              <label key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={data.noEntryReasons.includes(reason)}
                  onChange={(e) => {
                    setData(prev => ({
                      ...prev,
                      noEntryReasons: e.target.checked
                        ? [...prev.noEntryReasons, reason]
                        : prev.noEntryReasons.filter(r => r !== reason),
                    }));
                  }}
                />
                <span className="text-sm text-foreground">{reason}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-primary block mb-2">Notas Adicionales</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Describe qué observaste hoy..."
              className="w-full p-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-titles font-bold text-primary">Checklist Pre-Trading</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{todayDisplay}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border text-xs font-semibold text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Ventana: 9:30 - 10:15 AM (NY)
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className="h-full gold-gradient transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between gap-1">
          {STEP_LABELS.map((label, idx) => {
            const Icon = stepIcons[idx];
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-titles font-bold transition-all ${
                  isActive ? 'gold-gradient text-primary-foreground gold-shadow' :
                  isCompleted ? 'bg-accent text-accent-foreground' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-[10px] md:text-xs transition-all ${
                  isActive || isCompleted ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-surface p-5 md:p-8 min-h-[400px] mb-6">
        <div className="flex items-center gap-3 mb-2">
          {(() => { const Icon = stepIcons[currentStep - 1]; return <Icon className="w-6 h-6 text-primary" />; })()}
          <h2 className="text-lg md:text-xl font-titles font-bold text-primary">
            Paso {currentStep}: {currentStep <= 7 ? WIZARD_STEPS_DATA[currentStep - 1].title : 'Registro del Trade'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {currentStep <= 7 ? WIZARD_STEPS_DATA[currentStep - 1].subtitle : 'Decisión final y registro'}
        </p>

        {currentStep <= 7 ? renderChecklistStep(currentStep - 1) : renderStep8()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <button
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-5 py-3 border-2 border-border rounded-lg font-titles font-semibold text-sm text-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(s => Math.min(totalSteps, s + 1))}
            className="flex items-center gap-2 px-5 py-3 gold-gradient text-primary-foreground rounded-lg font-titles font-semibold text-sm hover:opacity-90 transition-all gold-shadow"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-lg font-titles font-semibold text-sm hover:opacity-90 transition-all"
          >
            <Check className="w-4 h-4" /> Finalizar y Guardar
          </button>
        )}
      </div>
    </div>
  );
}
