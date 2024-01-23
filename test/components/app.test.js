import { h } from 'preact';
import { render } from '@testing-library/preact';

import App from '../../src/components/App';

describe('App component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
