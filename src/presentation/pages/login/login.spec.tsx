import React from "react";
import { BrowserRouter } from 'react-router-dom'
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  cleanup,
  waitFor,
} from "@testing-library/react";
import faker from "faker";
import 'jest-localstorage-mock'

import Login from "./login";

import { ValidationSpy, AuthenticationSpy } from "@/presentation/test";
import { InvalidCredentialsError } from "@/domain/errors";

type SutTypes = {
  sut: RenderResult;
  validationSpy: ValidationSpy;
  authenticationSpy: AuthenticationSpy;
};

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const makeSut = (): SutTypes => {
  const validationSpy = new ValidationSpy();
  const authenticationSpy = new AuthenticationSpy();
  validationSpy.errorMessage = faker.random.words();
  const sut = render(
    <BrowserRouter>
      <Login validation={validationSpy} authentication={authenticationSpy} />
    </BrowserRouter>
  );
  return {
    sut,
    validationSpy,
    authenticationSpy,
  };
};

const populateEmailField = (email = faker.internet.email()): void => {
  const emailInput = screen.getByTestId("email");
  fireEvent.input(emailInput, { target: { value: email } });
}

const populatepasswordField = (password = faker.internet.email()): void => {
  const passwordInput = screen.getByTestId("password");
  fireEvent.input(passwordInput, {
    target: { value: password },
  });
}

const simulateValidSubmit = (
  email = faker.internet.email(),
  password = faker.internet.password()
): void => {
  populateEmailField(email)
  populatepasswordField(password)

  const submitButton = screen.getByTestId("submit");
  fireEvent.click(submitButton)
};

const simulateStatusForField = (fieldName: string, validationError?: string): void => {
  const emailStatus = screen.getByTestId(`${fieldName}-status`);
  expect(emailStatus.title).toBe(validationError || "Tudo certo!");
  expect(emailStatus.textContent).toBe(validationError ? "🔴" : "🟢");
}

describe("Login", () => {
  afterEach(cleanup);
  beforeEach(() => {
    localStorage.clear()
  })

  it("should start with initial state", () => {
    const { validationSpy } = makeSut();

    const errorWrap = screen.getByTestId("error-wrap");
    expect(errorWrap.childElementCount).toBe(0);

    const submitButton = screen.getByTestId("submit") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    simulateStatusForField("email", validationSpy.errorMessage)
    simulateStatusForField("password", validationSpy.errorMessage)
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

    populateEmailField()
    simulateStatusForField("email", validationSpy.errorMessage)
  });

  it("should show password error if Validation fails", () => {
    const { validationSpy } = makeSut();

    populatepasswordField()
    simulateStatusForField("password", validationSpy.errorMessage)
  });

  it("should show valid email state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    populateEmailField()
    simulateStatusForField("email")
  });

  it("should show valid password state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    populatepasswordField()
    simulateStatusForField("password")
  });

  it("should enable submit button if form is valid", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    populateEmailField()
    populatepasswordField()

    const submitButton = screen.getByTestId("submit") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it("should show spinner on submit", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    simulateValidSubmit();

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeTruthy();
  });

  it("should call Authentication with correct values", () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;

    const email = faker.internet.email();
    const password = faker.internet.password();
    simulateValidSubmit(email, password);

    expect(authenticationSpy.params).toEqual({
      email,
      password,
    });
  });

  it("should call Authentication only once", () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;

    simulateValidSubmit();
    simulateValidSubmit();

    expect(authenticationSpy.callsCount).toBe(1)
  });

  it("should not call Authentication if form is invalid", () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = faker.random.words();

    populateEmailField()
    fireEvent.submit(screen.getByTestId("form"));

    expect(authenticationSpy.callsCount).toBe(0)
  });

  it("should present erro if Authentication fails", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;
    const error = new InvalidCredentialsError()
    jest
      .spyOn(authenticationSpy ,'auth')
      .mockReturnValueOnce(Promise.reject(error))

    simulateValidSubmit();
    const errorWrap = screen.getByTestId("error-wrap");
    await waitFor(() => errorWrap)
    expect(errorWrap.childElementCount).toBe(1);
    const mainError = screen.getByTestId("main-error");
    expect(mainError.textContent).toBe(error.message)
  });

  it("should add accessToken to localStorage on success", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;
    
    simulateValidSubmit();
    await waitFor(() => screen.getByTestId("form"))
    expect(localStorage.setItem)
      .toHaveBeenCalledWith('accessToken', authenticationSpy.account.accessToken)
  });

  it("should go to SignUp page", async () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    
    const register = screen.getByTestId("signup");
    fireEvent.click(register);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/signup')
  });
});
