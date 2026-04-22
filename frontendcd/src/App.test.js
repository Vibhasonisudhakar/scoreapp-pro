import { render, screen } from '@testing-library/react';
import App from './App';

test('renders assessment title', () => {
  render(<App />);
  const titleElement = screen.getByText(/SA Excellency Model Interactive Assessment/i);
  expect(titleElement).toBeInTheDocument();
});
