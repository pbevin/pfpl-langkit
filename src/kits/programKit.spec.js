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

  it("starts in system T", () => {
    expect(initialState.lang).to.eq("dpcf");
  });

  specify("program text changed", () => {
    const oldState = { text: "123" };
    const action = textChanged("1234");

    expect(programReducer(oldState, action).text).to.eq("1234");
  });

  specify("reverting the prelude", () => {
    const oldState = {
      lang: "mylang",
      preludes: {
        mylang: "prelude for mylang"
      },
      text: "abc"
    };
    const newState = programReducer(oldState, revertPrelude());
    expect(newState.text).to.eq("prelude for mylang");
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

  it("changes the language via setLanguage", () => {
    let state = {
      lang: "dpcf",
      text: "xxx",
      preludes: {
        dpcf: "DPCF prelude",
        syst: "System T prelude"
      }
    };

    state = programReducer(state, actions.setLanguage("syst"));
    expect(state.lang).to.eq("syst");
  });

  it("changes the prelude when the language changes", () => {
    let state = {
      lang: "dpcf",
      text: "xxx",
      preludes: {
        dpcf: "DPCF prelude",
        syst: "System T prelude"
      }
    };

    state = programReducer(state, actions.setLanguage("syst"));
    expect(state.text).to.eq("System T prelude");
  });
});
