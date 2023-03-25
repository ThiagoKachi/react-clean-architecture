import React from 'react'

import { Spinner } from '@/presentation/components/spinner/Spinner'
import Header from '@/presentation/components/login-header/login-header'
import Footer from '@/presentation/components/footer/footer'
import Input from '@/presentation/components/input/input'

import Styles from './login-styles.scss'

export function Login() {
  return (
    <div className={Styles.login}>
      <Header />

      <form className={Styles.form}>
        <h2>Login</h2>

        <Input type="email" name="email" placeholder='Digite seu e-mail' />
        <Input type="password" name="password" placeholder='Digite sua senha' />

        <button type="submit" className={Styles.submit}>Entrar</button>
        <span className={Styles.link}>Criar conta</span>

        <div className={Styles.errorWrap}>
          <Spinner className={Styles.spinner} />
          <span className={Styles.error}>Erro</span>
        </div>
      </form>

      <Footer />
    </div>
  )
}
