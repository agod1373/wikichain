import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import Main from './components/main/Main'
import Wiki from "./components/wikis/Wiki"
import './App.scss'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Main} /> 
        <Route path='/:title' component={Wiki} /> 
      </Switch>
    </Router>
  );
}

export default App;
