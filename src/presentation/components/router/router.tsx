import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

type Props = {
  MakeLogin: React.FC;
}

export default function Router({ MakeLogin }: Props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<MakeLogin />}
        />
      </Routes>
    </BrowserRouter>
  );
}
