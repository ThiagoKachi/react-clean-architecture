import React, { useContext } from "react";

import Context from '@/presentation/contexts/form/form-context'

import Styles from './input-styles.scss'

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export default function Input(props: InputProps) {
  const { state, setState } = useContext(Context)
  const error = state[`${props.name}Error`]

  function getStatus(): string {
    return '🔴'
  }

  function getTitle(): string {
    return error
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    setState({
      ...state,
      [name]: value
    })
  }

  return (
    <div className={Styles.inputWrap}>
      <input data-testid={props.name} {...props} onChange={handleChange} />
      <span data-testid={`${props.name}-status`} title={getTitle()} className={Styles.status}>{getStatus()}</span>
    </div>
  )
}
