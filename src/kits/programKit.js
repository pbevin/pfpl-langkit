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
  },

  setLanguage(lang) {
    return { type: "SET_LANG", lang };
  }
};

const systPrelude = `
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

const dpcfPrelude = `
(define two (s (s z)))

(define plus
  (fun (x)
    (fix a
      (fun (y)
        (case y
          (zero x)
          ((s y1) (s (a y1))))))))
`.trim();


const initialState = {
  preludes: {
    dpcf: dpcfPrelude,
    syst: systPrelude
  },
  text: "",
  lang: "dpcf",
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
      return { ...state, text: state.preludes[state.lang] };

    case "TOGGLE_FLAG":
      return { ...state, [action.flag]: !state[action.flag] };

    case "SET_FLAG":
      return { ...state, [action.flag]: action.value };

    case "SET_LANG":
      return { ...state, lang: action.lang, text: state.preludes[action.lang] };
  }

  return state;
}
