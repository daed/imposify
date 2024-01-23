// index.js
import './global.css'; // Adjust the path according to your project structure
import { h, render } from 'preact';
import App from './components/App';


render(<App />, document.getElementById('app'));

