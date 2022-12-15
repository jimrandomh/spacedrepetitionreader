import React from 'react'

export function TextAreaInput({label, value, setValue}: {
  label: string,
  value: string,
  setValue: (newValue: string)=>void,
}) {
  return <div>
    <div>{label}</div>
    <textarea
      value={value}
      onChange={ev=>setValue(ev.target.value)}
    />
  </div>
}
