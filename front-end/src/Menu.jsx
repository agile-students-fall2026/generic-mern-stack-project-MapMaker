
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Menu.css'
import api from './api'

function Menu() {
    const navigate = useNavigate()
    const [menu, setMenu] = useState({ user: '', links: [] })

    useEffect(() => {
        api('/menu').then(setMenu).catch(() => setMenu({ user: 'Guest', links: [] }))
    }, [])

    return (
        <div className="menu-overlay">
            <div className="menu-panel">
                <button className="close-button" onClick={() => navigate(window.history.state?.idx > 0 ? -1 : '/home')}>
                    Close
                </button>

                <p className="menu-user">{menu.user}</p>

                {menu.links.map((link) => (
                    <button className="menu-link" key={link.path} onClick={() => navigate(link.path)}>
                        {link.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Menu
