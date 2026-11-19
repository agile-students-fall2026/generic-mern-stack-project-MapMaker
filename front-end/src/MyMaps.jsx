import { useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './MyMaps.css'


function MyMaps({ maps, onCreateMap, onDeleteMap, onDuplicateMap,onshareMap, mapError }){
    const [newMap,setNewMap]=useState("")
    const [error,setError]=useState("")
    async function createNewMap(event){
        event.preventDefault()
        if (newMap.trim()==="") return
        try {
            const map = await onCreateMap(newMap)
            setNewMap("")
            navigate("/Map-Editor", { state: { map:map } })
        } catch (err) { setError(err.message) }
        


    }

    async function deleteMap(map) {
        if (!window.confirm(`Delete "${map.name}"?`)) return
        try {
            await onDeleteMap(map.number)
        } catch (err) { setError(err.message) }
    }
    async function duplicateMap(map) {
        try {
            await onDuplicateMap(map.number)
        } catch (err) { setError(err.message) }

    }

     async function shareMap(map) {
        const email = window.prompt("Enter collaborator email:")
        if (!email || email.trim() === "") return
        try {
            await onshareMap(map.number, email)
        } catch (err) { setError(err.message) }
    }


    const navigate=useNavigate()
    const location = useLocation()
    return(
        <div className="my-maps">
            <header>
                <h2>
                Logo
                </h2>
                <button onClick={() => navigate('/menu', {
                state: { backgroundLocation: location }
                })}>
                Menu
                </button>
            </header>
            
        <h1>My Maps</h1>
        {mapError && <p role="alert">Could not load maps: {mapError}</p>}
        {maps.length === 0 && !mapError && <p>No maps yet. Create one below or browse historical maps.</p>}
         <div className="map-list">
            {maps.map((map)=>(
            <div className="map-item" key={map.number}>
            <button type="button"
                className="map-card"
                onClick={() => navigate("/Map-Editor", { state: {  map:map } })}
            > 
                <div className="map-picture">
                {map.asset ? <img src={map.image} alt="Map Preview" /> : <span>World map</span>}
                </div>
                <div className="map-name">
                    <p>{map.name}</p>

                </div>
                
                </button>
                <button type="button" className="delete-map" onClick={() => deleteMap(map)}>Delete</button>
                <button type="button" className="duplicate-map" onClick={() => duplicateMap(map)}>Duplicate</button>
                <button type="button" className="share-map" onClick={() => shareMap(map)}>Share</button>
            </div>
            ))}
            
        </div>

        <form className="create-new-map" onSubmit={createNewMap}>
            <input type="text" 
            placeholder="Create a New Map" 
            value={newMap}
            onChange={(event) => setNewMap(event.target.value)} /> 
            
            <button type="submit">
            Send
            </button>
        </form>
        {error && <p role="alert">{error}</p>}
        <button onClick={() => navigate('/search')}>Browse historical maps</button>
      

        </div>
    )


}
export default MyMaps
