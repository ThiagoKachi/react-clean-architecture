import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Footer,
  LoginHeader,
  Input,
  FormStatus,
} from "@/presentation/components";
import Context from "@/presentation/contexts/form/form-context";
import { Validation } from "@/presentation/protocols/validation";
import { Authentication } from "@/domain/usecases";

import Styles from "./login-styles.scss";

type Props = {
  validation: Validation;
  authentication: Authentication;
};

export default function Login({ validation, authentication }: Props) {
  const navigate = useNavigate();

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    try {
      if (state.isLoading || state.emailError || state.passwordError) return;
      setState({ ...state, isLoading: true });
      const account = await authentication.auth(
        { email: state.email, password: state.password }
      );
      localStorage.setItem("accessToken", account.accessToken);
      navigate("/", { replace: true });
    } catch (error) {
      setState({ ...state, isLoading: false, mainError: error.message });
    }
  }

  return (
    <div className={Styles.login}>
      <LoginHeader />

      <Context.Provider value={{ state, setState }}>
        <form data-testid="form" className={Styles.form} onSubmit={handleSubmit}>
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
          <span
            data-testid="signup"
            onClick={() => navigate('/signup')}
            className={Styles.link}
          >
            Criar conta
          </span>

          <FormStatus />
        </form>
      </Context.Provider>

      <Footer />
    </div>
  );
}
