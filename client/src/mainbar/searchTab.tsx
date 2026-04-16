import './SearchTab.css'
type searchtab = {
  setFilter:Function
}
function SearchTab(prop:searchtab) {
  function testFunc(event:React.ChangeEvent<HTMLInputElement>){
    prop.setFilter(String(event.target.value))
  }
  return (
    <div onChange={testFunc}className="search-container">
      <input 
        type="text" 
        placeholder="Buscar nos seus decks..." 
      />
    </div>
  )
}

export default SearchTab