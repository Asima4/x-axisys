import './Buttons.css'

export const FillButton = ({ onClick, text }) => {
  return (
    <button onClick={onClick} className="fil_btn transition-colors">
      {text}
    </button>
  )
}

export const OuterButton = ({ onClick, text, className }) => {
  return (
    <button onClick={onClick} className={`${className} outer_btn transition-colors`}>
      {text}
    </button>
  )
}
