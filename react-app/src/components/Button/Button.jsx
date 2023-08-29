import PropTypes from 'prop-types';
import './Button.css'

const Button = (props) => {
    return (
        <button {...props} className={"button " + props.className} />
    )
}

Button.propTypes = {
    className: PropTypes.string
}

export default Button