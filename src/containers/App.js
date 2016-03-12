// This file bootstraps the app with the boilerplate necessary
// to support hot reloading in Redux
import React, {PropTypes} from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PrimitiveRecursionApp from "../components/PrimitiveRecursionApp";
import { actions as ProgramActions } from "../kits/programKit";

class App extends React.Component {
  render() {
    const { program, actions } = this.props;

    return (
      <PrimitiveRecursionApp
        program={program}
        actions={actions}
      />
    );
  }
}

App.propTypes = {
  actions: PropTypes.object.isRequired,
  program: PropTypes.object.isRequired
};


function mapStateToProps({ program }) {
  return { program };
  // const sexp = muParser(program.text);
  // return { program, sexp: JSON.stringify(sexp, 0, 2) };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(ProgramActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
