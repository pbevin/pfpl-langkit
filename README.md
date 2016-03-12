A web playground of Gödel's System T. This makes a lot more sense if you read chapter 9 of
[Pracical Foundations for Programming Lanugages](https://www.cs.cmu.edu/~rwh/), 2nd edition.

## Usage

[Demo](http://larks.petebevin.com/primrec/).

* The REPL on the right is the main interface. Try things like `three`, `double(5)`, `plus(4)(3)`, and `fact(4)`.
* The toggle buttons mean:
  * **Trace Execution**: Show what rule is being used at each step. Rule numbers like `9.3(f)` refer to the equation numbers in the text.
  * **Show Decimal Values**: print `6` instead of `S(S(S(S(S(S(Z))))))`, and `6 + x` instead of `S(S(S(S(S(S(x))))))`.
  * **Lazy Evaluation**: Switch to using lazy evaluation (i.e., don't apply bracketed static and dynamic rules).
  * **Use the force**: In lazy mode, don't stop at head normal form, but keep forcing evaluation until there is a value under eager dynamics.
* You can also type these as commands if you don't want to reach for the mouse: `trace`, `decimal`, `lazy`, and `force` respectively.
* The editor at right is what I'm optimistically calling a "standard prelude", and you can add functions there. They won't get saved anywhere, though.

## Building

Clone this repository, then `npm install` and `npm start`. You can make a distribution build with `npm run build`,
which drops files into the `dist` folder.
