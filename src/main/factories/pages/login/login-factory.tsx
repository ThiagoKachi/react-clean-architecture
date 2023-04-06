import React from "react";
import { Login } from "@/presentation/pages";
import { makeRemoteAuthentication } from "../../usecases/authentication/remote-authentication-factory";
import { makeLoginValidation } from "./login-validation-factory";

export function makeLogin() {  
  return (
    <Login
      authentication={makeRemoteAuthentication()}
      validation={makeLoginValidation()}
    />
  )
}