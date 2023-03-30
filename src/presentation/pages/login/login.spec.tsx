import React from "react";
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  cleanup,
} from "@testing-library/react";
import faker from "faker";

import Login from "./login";

import { ValidationSpy } from "@/presentation/test";
import { Authentication, AuthenticationParams } from "@/domain/usecases";
import { AccountModel } from "@/domain/models";
import { mockAccountModel } from "@/domain/test";

class AuthenticationSpy implements Authentication {
  account = mockAccountModel()
  params = {} as AuthenticationParams

  async auth(params: AuthenticationParams): Promise<AccountModel> {
    this.params = params;
    return Promise.resolve(this.account);
  }
}

type SutTypes = {
  sut: RenderResult;
  validationSpy: ValidationSpy;
  authenticationSpy: AuthenticationSpy;
};

const makeSut = (): SutTypes => {
  const validationSpy = new ValidationSpy();
  const authenticationSpy = new AuthenticationSpy();
  validationSpy.errorMessage = faker.random.words();
  const sut = render(<Login validation={validationSpy} authentication={authenticationSpy} />);
  return {
    sut,
    validationSpy,
    authenticationSpy
  };
};

describe("Login", () => {
  afterEach(cleanup);

  it("should start with initial state", () => {
    const { validationSpy } = makeSut();

    const errorWrap = screen.getByTestId("error-wrap");
    expect(errorWrap.childElementCount).toBe(0);

    const submitButton = screen.getByTestId("submit") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    const emailStatus = screen.getByTestId("email-status");
    expect(emailStatus.title).toBe(validationSpy.errorMessage);
    expect(emailStatus.textContent).toBe("🔴");

    const passwordStatus = screen.getByTestId("password-status");
    expect(passwordStatus.title).toBe(validationSpy.errorMessage);
    expect(passwordStatus.textContent).toBe("🔴");
  });

  it("should call validation with correct email", () => {
    const { validationSpy } = makeSut();

    const emailInput = screen.getByTestId("email");
    const email = faker.internet.email();
    fireEvent.input(emailInput, { target: { value: email } });

    expect(validationSpy.fieldName).toBe("email");
    expect(validationSpy.fieldValue).toBe(email);
  });

  it("should call validation with correct password", () => {
    const { validationSpy } = makeSut();

    const passwordInput = screen.getByTestId("password");
    const password = faker.internet.password();
    fireEvent.input(passwordInput, { target: { value: password } });

    expect(validationSpy.fieldName).toBe("password");
    expect(validationSpy.fieldValue).toBe(password);
  });

  it("should show email error if Validation fails", () => {
    const { validationSpy } = makeSut();

    const emailInput = screen.getByTestId("email");
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } });
    const emailStatus = screen.getByTestId("email-status");
    expect(emailStatus.title).toBe(validationSpy.errorMessage);
    expect(emailStatus.textContent).toBe("🔴");
  });

  it("should show password error if Validation fails", () => {
    const { validationSpy } = makeSut();

    const passwordInput = screen.getByTestId("password");
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    });
    const passwordStatus = screen.getByTestId("password-status");
    expect(passwordStatus.title).toBe(validationSpy.errorMessage);
    expect(passwordStatus.textContent).toBe("🔴");
  });

  it("should show valid email state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    const emailInput = screen.getByTestId("email");
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } });
    const emailStatus = screen.getByTestId("email-status");
    expect(emailStatus.title).toBe("Tudo certo!");
    expect(emailStatus.textContent).toBe("🟢");
  });

  it("should show valid password state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    const passwordInput = screen.getByTestId("password");
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    });
    const passwordStatus = screen.getByTestId("password-status");
    expect(passwordStatus.title).toBe("Tudo certo!");
    expect(passwordStatus.textContent).toBe("🟢");
  });

  it("should enable submit button if form is valid", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    const emailInput = screen.getByTestId("email");
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } });
    const passwordInput = screen.getByTestId("password");
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    });

    const submitButton = screen.getByTestId("submit") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it("should show spinner on submit", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    const emailInput = screen.getByTestId("email");
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } });
    const passwordInput = screen.getByTestId("password");
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    });

    const submitButton = screen.getByTestId("submit");
    fireEvent.click(submitButton);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeTruthy();
  });

  it("should call Authentication with correct values", () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;

    const emailInput = screen.getByTestId("email");
    const email = faker.internet.email();
    fireEvent.input(emailInput, { target: { value: email } });
    const passwordInput = screen.getByTestId("password");
    const password = faker.internet.password();
    fireEvent.input(passwordInput, {
      target: { value: password },
    });

    const submitButton = screen.getByTestId("submit");
    fireEvent.click(submitButton);
    expect(authenticationSpy.params).toEqual({
      email,
      password
    });
  });
});
