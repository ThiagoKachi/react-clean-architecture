import React, { memo } from "react";

import { Logo } from '@/presentation/components'

import Styles from './login-header-styles.scss'

function LoginHeader() {
  return (
    <header className={Styles.header}>
      <Logo />
      <h1>4Dev - Enquetes para Programadores</h1>
    </header>
  )
}

export default memo(LoginHeader)