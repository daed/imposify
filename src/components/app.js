import { h, Component } from 'preact';
import Sidebar from './sidebar';
import MainBody from './mainbody';

//import './style.css';

class App extends Component {
  state = { activeSection: 'Section1' };

  changeSection = (section) => {
    this.setState({ activeSection: section });
  };

  render() {
    const { activeSection } = this.state;

    return (
        <div class="app-container" style="display: flex;">
          <Sidebar changeSection={this.changeSection} />
          <MainBody activeSection={activeSection} />
        </div>
    );
  }
}

export default App;


/*
import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';
import Home from './home';
import Profile from './profile';

export default class App extends Component {
	 // Gets fired when the route changes.
	 //	@param {Object} event		"change" event from [preact-router](https://github.com/preactjs/preact-router)
	 //	@param {string} event.url	The newly routed URL
	
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Profile path="/profile/" user="me" />
					<Profile path="/profile/:user" />
				</Router>
			</div>
		);
	}
}
*/