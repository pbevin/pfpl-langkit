export const Flags = {
  decimal: "decimal",
  trace: "trace",
  lazy: "lazy",
  force: "force"
};

export const actions = {
  textChanged(text) {
    return { type: "TEXT_CHANGED", text };
  },

  revertPrelude() {
    return { type: "REVERT_PRELUDE" };
  },

  toggleFlag(flag) {
    return { type: "TOGGLE_FLAG", flag };
  },

  setFlag(flag, value) {
    return { type: "SET_FLAG", flag, value };
  }
};

const prelude = `
two = S(S(Z));
three = S(two);
double = \\n : Nat -> rec n {
  Z -> Z | S(u) with v -> S(S(v))
};
ten = double(5);

plus = \\a : Nat -> \\b : Nat -> rec a {
  Z -> b | S(n) with m -> S(m)
};

times = \\a : Nat -> \\b : Nat -> rec a {
  Z -> 0 | S(n) with m -> plus(b)(m)
};

fact = \\n : Nat -> rec n {
  Z -> 1 | S(x) with y -> times(S(x))(y)
};
`.trim();

const initialState = {
  text: "",
  prelude,
  [Flags.trace]: false,
  [Flags.decimal]: false,
  [Flags.lazy]: false,
  [Flags.force]: false
};


export
function programReducer(state = initialState, action) {
  switch (action.type) {
    case "TEXT_CHANGED":
      return { ...state, text: action.text };

    case "REVERT_PRELUDE":
      return { ...state, text: state.prelude };

    case "TOGGLE_FLAG":
      return { ...state, [action.flag]: !state[action.flag] };

    case "SET_FLAG":
      return { ...state, [action.flag]: action.value };
  }

  return state;
}
