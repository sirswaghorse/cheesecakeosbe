import { useEffect, useReducer } from "react";
import {
  applyOperator,
  backspace,
  clearAll,
  clearEntry,
  equals,
  expressionLabel,
  initialCalcState,
  inputDecimal,
  inputDigit,
  negate,
  percent,
  type CalcState,
  type Operator,
} from "@/lib/calculator";

type Action =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "negate" }
  | { type: "percent" }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "clearEntry" };

const reducer = (state: CalcState, action: Action): CalcState => {
  switch (action.type) {
    case "digit": return inputDigit(state, action.digit);
    case "decimal": return inputDecimal(state);
    case "operator": return applyOperator(state, action.operator);
    case "equals": return equals(state);
    case "negate": return negate(state);
    case "percent": return percent(state);
    case "backspace": return backspace(state);
    case "clear": return clearAll();
    case "clearEntry": return clearEntry(state);
  }
};

const KEY_MAP: Record<string, Action> = {
  ".": { type: "decimal" },
  "+": { type: "operator", operator: "+" },
  "-": { type: "operator", operator: "-" },
  "*": { type: "operator", operator: "×" },
  "/": { type: "operator", operator: "÷" },
  Enter: { type: "equals" },
  "=": { type: "equals" },
  Backspace: { type: "backspace" },
  Escape: { type: "clear" },
  "%": { type: "percent" },
};

const keyCls = "h-11 rounded text-sm font-medium transition-colors border border-border/50 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground active:translate-y-px";
const opCls = "h-11 rounded text-sm font-semibold transition-colors border border-border/50 bg-muted text-foreground hover:bg-accent hover:text-accent-foreground active:translate-y-px";

const Calculator = () => {
  const [state, dispatch] = useReducer(reducer, initialCalcState);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        dispatch({ type: "digit", digit: e.key });
        return;
      }
      const action = KEY_MAP[e.key];
      if (action) {
        e.preventDefault();
        dispatch(action);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground p-3 gap-3 select-none">
      <div className="rounded border border-border/60 bg-background/60 px-3 py-2 text-right">
        <div className="h-4 text-xs text-muted-foreground truncate" aria-live="polite">
          {expressionLabel(state)}
        </div>
        <div
          className={`font-mono truncate ${state.error ? "text-lg text-destructive" : "text-2xl"}`}
          role="status"
          aria-label="Calculator display"
        >
          {state.display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 flex-1 content-start">
        <button className={opCls} onClick={() => dispatch({ type: "clearEntry" })} aria-label="Clear entry">CE</button>
        <button className={opCls} onClick={() => dispatch({ type: "clear" })} aria-label="Clear all">C</button>
        <button className={opCls} onClick={() => dispatch({ type: "backspace" })} aria-label="Backspace">⌫</button>
        <button className={opCls} onClick={() => dispatch({ type: "operator", operator: "÷" })} aria-label="Divide">÷</button>

        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "7" })}>7</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "8" })}>8</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "9" })}>9</button>
        <button className={opCls} onClick={() => dispatch({ type: "operator", operator: "×" })} aria-label="Multiply">×</button>

        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "4" })}>4</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "5" })}>5</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "6" })}>6</button>
        <button className={opCls} onClick={() => dispatch({ type: "operator", operator: "-" })} aria-label="Subtract">−</button>

        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "1" })}>1</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "2" })}>2</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "3" })}>3</button>
        <button className={opCls} onClick={() => dispatch({ type: "operator", operator: "+" })} aria-label="Add">+</button>

        <button className={keyCls} onClick={() => dispatch({ type: "negate" })} aria-label="Negate">±</button>
        <button className={keyCls} onClick={() => dispatch({ type: "digit", digit: "0" })}>0</button>
        <button className={keyCls} onClick={() => dispatch({ type: "decimal" })} aria-label="Decimal point">.</button>
        <button
          className="h-11 rounded text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:brightness-110 active:translate-y-px"
          onClick={() => dispatch({ type: "equals" })}
          aria-label="Equals"
        >
          =
        </button>

        <button className={`${opCls} col-span-4`} onClick={() => dispatch({ type: "percent" })} aria-label="Percent">%</button>
      </div>
    </div>
  );
};

export default Calculator;
