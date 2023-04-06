import React from "react";
import ReactDOM from "react-dom";

import '@/presentation/styles/global.scss'
import { Router } from "@/presentation/components";
import { makeLogin } from "./factories/pages/login/login-factory";

ReactDOM.render(
  <Router MakeLogin={makeLogin} />,
  document.getElementById("main")
);