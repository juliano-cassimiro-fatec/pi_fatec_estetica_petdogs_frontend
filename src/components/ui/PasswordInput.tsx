import { useState } from "react"
import type { InputHTMLAttributes } from "react"
import Icon from "./Icon"

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">

function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const actionLabel = visible ? "Ocultar senha" : "Mostrar senha"

  return (
    <div className="relative">
      <input
        {...props}
        className={`${className} w-full pr-12`}
        type={visible ? "text" : "password"}
      />
      <button
        aria-label={actionLabel}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-slate-500 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-blue-500"
        onClick={() => setVisible((current) => !current)}
        title={actionLabel}
        type="button"
      >
        <Icon className="h-5 w-5" name={visible ? "eye-off" : "eye"} />
      </button>
    </div>
  )
}

export default PasswordInput
