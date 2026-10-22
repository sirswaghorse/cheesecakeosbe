import { describe, expect, it } from "vitest";
import {
  applyOperator,
  backspace,
  clearAll,
  equals,
  formatNumber,
  initialCalcState,
  inputDecimal,
  inputDigit,
  negate,
  percent,
  type CalcState,
} from "@/lib/calculator";

const type = (state: CalcState, text: string): CalcState =>
  text.split("").reduce((s, ch) => (ch === "." ? inputDecimal(s) : inputDigit(s, ch)), state);

describe("calculator engine", () => {
  it("adds two numbers", () => {
    let s = type(initialCalcState, "12");
    s = applyOperator(s, "+");
    s = type(s, "7");
    s = equals(s);
    expect(s.display).toBe("19");
  });

  it("chains operations left to right", () => {
    let s = type(initialCalcState, "2");
    s = applyOperator(s, "+");
    s = type(s, "3");
    s = applyOperator(s, "×"); // settles 2+3 first
    expect(s.display).toBe("5");
    s = type(s, "4");
    s = equals(s);
    expect(s.display).toBe("20");
  });

  it("repeats the last operation on repeated equals", () => {
    let s = type(initialCalcState, "5");
    s = applyOperator(s, "+");
    s = type(s, "3");
    s = equals(s);
    expect(s.display).toBe("8");
    s = equals(s);
    expect(s.display).toBe("11");
  });

  it("handles division by zero with an error state that recovers", () => {
    let s = type(initialCalcState, "8");
    s = applyOperator(s, "÷");
    s = type(s, "0");
    s = equals(s);
    expect(s.error).toBe(true);
    expect(s.display).toBe("Cannot divide by zero");
    s = inputDigit(s, "4");
    expect(s.error).toBe(false);
    expect(s.display).toBe("4");
  });

  it("supports decimals and negation", () => {
    let s = type(initialCalcState, "1.5");
    s = negate(s);
    expect(s.display).toBe("-1.5");
    s = negate(s);
    expect(s.display).toBe("1.5");
    s = inputDecimal(s); // second decimal ignored
    expect(s.display).toBe("1.5");
  });

  it("computes percent relative to the stored value for add/subtract", () => {
    let s = type(initialCalcState, "200");
    s = applyOperator(s, "+");
    s = type(s, "10");
    s = percent(s);
    expect(s.display).toBe("20");
  });

  it("backspaces digits and clears", () => {
    let s = type(initialCalcState, "123");
    s = backspace(s);
    expect(s.display).toBe("12");
    s = clearAll();
    expect(s.display).toBe("0");
  });

  it("formats long results without crashing", () => {
    expect(formatNumber(1 / 3)).toBe("0.3333333333");
    expect(formatNumber(Infinity)).toBe("Error");
  });
});
