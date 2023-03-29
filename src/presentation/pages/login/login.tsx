import React, { useEffect, useState } from "react";

import {
  Footer,
  LoginHeader,
  Input,
  FormStatus,
} from "@/presentation/components";
import Context from "@/presentation/contexts/form/form-context";
import { Validation } from "@/presentation/protocols/validation";

import Styles from "./login-styles.scss";

type Props = {
  validation: Validation;
};

export default function Login({ validation }: Props) {
  const [state, setState] = useState({
    isLoading: false,
    email: "",
    password: "",
    emailError: "",
    passwordError: "",
    mainError: "",
  });

  useEffect(() => {
    setState((oldState) => ({
      ...oldState,
      emailError: validation.validate("email", state.email),
    }));
  }, [state.email]);

  useEffect(() => {
    setState((oldState) => ({
      ...oldState,
      passwordError: validation.validate("password", state.password),
    }));
  }, [state.password]);

  return (
    <div className={Styles.login}>
      <LoginHeader />

      <Context.Provider value={{ state, setState }}>
        <form className={Styles.form}>
          <h2>Login</h2>

          <Input type="email" name="email" placeholder="Digite seu e-mail" />
          <Input
            type="password"
            name="password"
            placeholder="Digite sua senha"
          />

          <button
            data-testid="submit"
            disabled={!!state.emailError || !!state.passwordError}
            type="submit"
            className={Styles.submit}
          >
            Entrar
          </button>
          <span className={Styles.link}>Criar conta</span>

          <FormStatus />
        </form>
      </Context.Provider>

      <Footer />
    </div>
  );
}
