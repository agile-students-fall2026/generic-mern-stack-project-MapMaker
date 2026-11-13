import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MapPreview from './map-editor/MapPreview'
import MapImage from './map-editor/MapImage'
import { IMAGE_STYLES } from './map-editor/editorData'
import { useEditor } from './map-editor/editorContext'
import api from './api'
import './AiChat.css'

function AiChat(){
    const navigate=useNavigate()
    const location=useLocation()
    const { map } = useEditor()
    const [message, setMessage]=useState("")
    const firstMessage=location.state?.message
    const [chat, setChat]=useState(firstMessage
        ? [{ from: "You", text: firstMessage }, { from: "AI", text: location.state?.reply || "Request received." }]
        : [{ from: "AI", text: "Hi! Tell me what you want to change on your map." }]
    )

    async function sendMessage(event){
        event.preventDefault()
        if (message.trim()==="") return
        try {
            const { reply } = await api('/chat', { method: 'POST', body: { message } })
            setChat([...chat, { from: "You", text: message }, { from: "AI", text: reply }])
        } catch (err) { setChat([...chat, { from: "AI", text: err.message }]) }
        setMessage("")
    }

    return(
        <div className="ai-chat">
            <header>
                <img className="logo" src="https://cdn-icons-png.flaticon.com/512/4746/4746231.png" alt="MapMaker Logo" onClick={()=>navigate("/home")} />
                <button onClick={()=>navigate("/menu", { state: { backgroundLocation: location } })}>Menu</button>
            </header>

            <h1>{map.title}</h1>
            <div className="chat-map">
                {map.asset ? <MapImage asset={map.asset} filter={IMAGE_STYLES.find((style) => style.id === map.imageStyle)?.filter} />
                    : <MapPreview styleId={map.styleId} selectedCountries={map.selectedCountries} />}
            </div>

            <div className="chat-messages">
                {chat.map((item, index)=>(
                    <div className={item.from==="You" ? "chat-row you" : "chat-row ai"} key={index}>
                        <span className="chat-name">{item.from}</span>
                        <p className="chat-bubble">{item.text}</p>
                    </div>
                ))}
            </div>

            <form className="chat-form" onSubmit={sendMessage}>
                <input placeholder="Your message" value={message} onChange={(event)=>setMessage(event.target.value)} />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}
export default AiChat
