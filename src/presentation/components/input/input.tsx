import React, { useContext } from "react";

import Context from '@/presentation/contexts/form/form-context'

import Styles from './input-styles.scss'

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export default function Input(props: InputProps) {
  const { errorState } = useContext(Context)
  const error = errorState[`${props.name}`]

  function getStatus(): string {
    return '🔴'
  }

  function getTitle(): string {
    return error
  }

  return (
    <div className={Styles.inputWrap}>
      <input {...props} />
      <span data-testid={`${props.name}-status`} title={getTitle()} className={Styles.status}>{getStatus()}</span>
    </div>
  )
}
