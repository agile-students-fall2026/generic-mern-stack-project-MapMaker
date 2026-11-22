import { useNavigate } from 'react-router-dom'
import './BackArrow.css'


function BackArrow({previous='/home'}){
    const navigate=useNavigate()
    function previousPage(){
        if (window.history.state?.idx > 0) {
        navigate(-1)
        } else {
        navigate(previous)
        }
}
    return (
        <button
            type="button"
            className="Back-arrow"
            onClick={previousPage}
            aria-label="Go back"
        >
            ←
        </button>
    )

}
export default BackArrow