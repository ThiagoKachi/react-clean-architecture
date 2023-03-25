import React from "react";
import { render, screen } from '@testing-library/react'
import Login from "./login";

describe('Login', () => {
  it('should not render spinner and error message on start', () => {
    render(<Login />)

    const errorWrap = screen.getByTestId('error-wrap')

    expect(errorWrap.childElementCount).toBe(0)
  });
});