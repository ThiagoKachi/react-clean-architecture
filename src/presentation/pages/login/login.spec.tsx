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

import { Login } from "@/presentation/pages";

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

const simulateValidSubmit = async (
  email = faker.internet.email(),
  password = faker.internet.password()
): Promise<void> => {
  populateEmailField(email)
  populatepasswordField(password)

  const form = screen.getByTestId("form");
  fireEvent.submit(form)
  await waitFor(() => form)
};

const testStatusForField = (fieldName: string, validationError?: string): void => {
  const emailStatus = screen.getByTestId(`${fieldName}-status`);
  expect(emailStatus.title).toBe(validationError || "Tudo certo!");
  expect(emailStatus.textContent).toBe(validationError ? "🔴" : "🟢");
}

const testErrorWrapChildCount = (count: number): void => {
  const errorWrap = screen.getByTestId("error-wrap");
  expect(errorWrap.childElementCount).toBe(count);
}

const testElementExists = (fieldName: string): void => {
  const el = screen.getByTestId(fieldName);
  expect(el).toBeTruthy();
}

const testElementText = (fieldName: string, text: string): void => {
  const el = screen.getByTestId(fieldName);
  expect(el.textContent).toBe(text)
}

const testButtonIsDisabled = (fieldName: string, isDisabled: boolean): void => {
  const button = screen.getByTestId(fieldName) as HTMLButtonElement;
  expect(button.disabled).toBe(isDisabled);
}

describe("Login", () => {
  afterEach(cleanup);
  beforeEach(() => {
    localStorage.clear()
  })

  it("should start with initial state", () => {
    const { validationSpy } = makeSut();

    testErrorWrapChildCount(0)

    testButtonIsDisabled("submit", true)

    testStatusForField("email", validationSpy.errorMessage)
    testStatusForField("password", validationSpy.errorMessage)
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
    testStatusForField("email", validationSpy.errorMessage)
  });

  it("should show password error if Validation fails", () => {
    const { validationSpy } = makeSut();

    populatepasswordField()
    testStatusForField("password", validationSpy.errorMessage)
  });

  it("should show valid email state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    populateEmailField()
    testStatusForField("email")
  });

  it("should show valid password state if Validation succeeds", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    populatepasswordField()
    testStatusForField("password")
  });

  it("should enable submit button if form is valid", () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    populateEmailField()
    populatepasswordField()

    testButtonIsDisabled("submit", false)
  });

  it("should show spinner on submit", async () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;

    await simulateValidSubmit();

    testElementExists("spinner")
  });

  it("should call Authentication with correct values", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;

    const email = faker.internet.email();
    const password = faker.internet.password();
    await simulateValidSubmit(email, password);

    expect(authenticationSpy.params).toEqual({ email, password });
  });

  it("should call Authentication only once", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;

    await simulateValidSubmit();
    await simulateValidSubmit();

    expect(authenticationSpy.callsCount).toBe(1)
  });

  it("should not call Authentication if form is invalid", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = faker.random.words();

    await simulateValidSubmit()

    expect(authenticationSpy.callsCount).toBe(0)
  });

  it("should present erro if Authentication fails", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;
    const error = new InvalidCredentialsError()
    jest
      .spyOn(authenticationSpy ,'auth')
      .mockReturnValueOnce(Promise.reject(error))

    await simulateValidSubmit();
    testErrorWrapChildCount(1)
    testElementText("main-error", error.message)
  });

  it("should add accessToken to localStorage on success", async () => {
    const { validationSpy, authenticationSpy } = makeSut();
    validationSpy.errorMessage = null;
    
    await simulateValidSubmit();
    expect(localStorage.setItem)
      .toHaveBeenCalledWith('accessToken', authenticationSpy.account.accessToken)
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/', { replace: true })
  });

  it("should go to SignUp page", async () => {
    const { validationSpy } = makeSut();
    validationSpy.errorMessage = null;
    
    const register = screen.getByTestId("signup");
    fireEvent.click(register);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/signup')
  });
});
