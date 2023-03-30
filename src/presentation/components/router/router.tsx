import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Login } from "@/presentation/pages";
import { ValidationSpy, AuthenticationSpy } from "@/presentation/test";

export default function Router() {
  const validationSpy = new ValidationSpy();
  const authenticationSpy = new AuthenticationSpy();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              validation={validationSpy}
              authentication={authenticationSpy}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
