import { expect } from "chai";

import { programReducer, actions, Flags } from "./programKit";

const { textChanged, revertPrelude, toggleFlag, setFlag } = actions;

const initialState = programReducer(undefined, { type: "@@INIT" });

describe("program reducer", () => {
  it("starts with empty text", () => {
    expect(initialState.text).to.eq("");
  });

  it("starts with all flags turned off", () => {
    expect(initialState.trace).to.eq(false);
    expect(initialState.decimal).to.eq(false);
    expect(initialState.lazy).to.eq(false);
  });

  specify("program text changed", () => {
    const oldState = { text: "123" };
    const action = textChanged("1234");

    expect(programReducer(oldState, action).text).to.eq("1234");
  });

  specify("reverting the prelude", () => {
    const oldState = { text: "abc", prelude: "prelude" };
    const newState = programReducer(oldState, revertPrelude());
    expect(newState).to.eql({ text: "prelude", prelude: "prelude" });
  });

  it("updates flags via setFlag", () => {
    let state = { };

    state = programReducer(state, setFlag(Flags.trace, true));
    expect(state.trace).to.eq(true);
    state = programReducer(state, setFlag(Flags.trace, false));
    expect(state.trace).to.eq(false);
  });

  it("toggles flags via toggleFlag", () => {
    let state = { trace: false };

    state = programReducer(state, toggleFlag(Flags.trace));
    expect(state.trace).to.eq(true);
    state = programReducer(state, toggleFlag(Flags.trace));
    expect(state.trace).to.eq(false);
  });
});
