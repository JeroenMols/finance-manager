import React from 'react';
import { render, screen } from '@testing-library/react';
import Stocks from './stocks';

test('renders learn react link', () => {
  // render(<Stocks />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
