export type Operator = "+" | "-" | "×" | "÷";

export interface CalcState {
  display: string;
  stored: number | null;
  pending: Operator | null;
  lastOperator: Operator | null;
  lastOperand: number | null;
  fresh: boolean;
  error: boolean;
}

export const initialCalcState: CalcState = {
  display: "0",
  stored: null,
  pending: null,
  lastOperator: null,
  lastOperand: null,
  fresh: true,
  error: false,
};

const MAX_DIGITS = 12;

const apply = (a: number, op: Operator, b: number): number | null => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? null : a / b;
  }
};

export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round(value * 1e10) / 1e10;
  const text = String(rounded);
  return text.length > MAX_DIGITS + 2 ? rounded.toPrecision(10).replace(/\.?0+$/, "") : text;
};

export const inputDigit = (state: CalcState, digit: string): CalcState => {
  if (state.error) return inputDigit(initialCalcState, digit);
  if (state.fresh) return { ...state, display: digit, fresh: false };
  const digits = state.display.replace(/[^0-9]/g, "");
  if (digits.length >= MAX_DIGITS) return state;
  const next = state.display === "0" ? digit : state.display === "-0" ? `-${digit}` : state.display + digit;
  return { ...state, display: next };
};

export const inputDecimal = (state: CalcState): CalcState => {
  if (state.error) return inputDecimal(initialCalcState);
  if (state.fresh) return { ...state, display: "0.", fresh: false };
  if (state.display.includes(".")) return state;
  return { ...state, display: `${state.display}.` };
};

export const negate = (state: CalcState): CalcState => {
  if (state.error || state.display === "0") return state;
  return {
    ...state,
    display: state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}`,
  };
};

export const percent = (state: CalcState): CalcState => {
  if (state.error) return state;
  const value = parseFloat(state.display);
  const base = state.stored ?? 0;
  const result = state.pending === "+" || state.pending === "-" ? (base * value) / 100 : value / 100;
  return { ...state, display: formatNumber(result), fresh: true };
};

export const backspace = (state: CalcState): CalcState => {
  if (state.error || state.fresh) return state;
  const next = state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith("-"))
    ? "0"
    : state.display.slice(0, -1);
  return { ...state, display: next };
};

export const clearAll = (): CalcState => ({ ...initialCalcState });

export const clearEntry = (state: CalcState): CalcState => ({
  ...state,
  display: "0",
  fresh: true,
  error: false,
});

const settle = (state: CalcState): { value: number; error: boolean } => {
  const current = parseFloat(state.display);
  if (state.stored !== null && state.pending) {
    const result = apply(state.stored, state.pending, current);
    if (result === null) return { value: 0, error: true };
    return { value: result, error: false };
  }
  return { value: current, error: false };
};

export const applyOperator = (state: CalcState, op: Operator): CalcState => {
  if (state.error) return state;
  // Chained operator while waiting for a new entry: just swap the operator.
  if (state.fresh && state.pending) return { ...state, pending: op };
  const { value, error } = settle(state);
  if (error) return { ...initialCalcState, display: "Cannot divide by zero", error: true };
  return {
    display: formatNumber(value),
    stored: value,
    pending: op,
    lastOperator: null,
    lastOperand: null,
    fresh: true,
    error: false,
  };
};

export const equals = (state: CalcState): CalcState => {
  if (state.error) return state;
  // Repeat-last-operation when pressing = again.
  if (!state.pending && state.lastOperator && state.lastOperand !== null) {
    const result = apply(parseFloat(state.display), state.lastOperator, state.lastOperand);
    if (result === null) return { ...initialCalcState, display: "Cannot divide by zero", error: true };
    return { ...state, display: formatNumber(result), fresh: true };
  }
  if (!state.pending) return state;
  const operand = parseFloat(state.display);
  const { value, error } = settle(state);
  if (error) return { ...initialCalcState, display: "Cannot divide by zero", error: true };
  return {
    display: formatNumber(value),
    stored: null,
    pending: null,
    lastOperator: state.pending,
    lastOperand: operand,
    fresh: true,
    error: false,
  };
};

export const expressionLabel = (state: CalcState): string => {
  if (state.stored !== null && state.pending) return `${formatNumber(state.stored)} ${state.pending}`;
  return "";
};
