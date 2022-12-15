import React from 'react'

export function TextInput({label, value, setValue, inputType}: {
  label: string,
  value: string,
  setValue: (newValue: string)=>void,
  inputType?: string,
}) {
  return <div>
    {label}
    <input
      value={value}
      onChange={ev=>setValue(ev.target.value)}
      type={inputType||"text"}
    />
  </div>
}