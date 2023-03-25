import React from "react";

import { Spinner } from "@/presentation/components";

import Styles from './form-status-styles.scss'

export default function FormStatus() {
  return (
    <div className={Styles.errorWrap}>
      <Spinner className={Styles.spinner} />
      <span className={Styles.error}>Erro</span>
    </div>
  )
}
