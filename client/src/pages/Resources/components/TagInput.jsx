function TagInput({ tags, value, onValue, onChange }) {
  function addTag() {
    const next = value.trim()
    if (!next || tags.includes(next)) return
    onChange([...tags, next])
    onValue('')
  }

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tags.map((tag) => (
          <button key={tag} type="button" onClick={() => onChange(tags.filter((item) => item !== tag))}>
            {tag} ×
          </button>
        ))}
      </div>
      <div className="tag-row">
        <input
          value={value}
          onChange={(event) => onValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder="Add tag and press Enter"
        />
        <button type="button" onClick={addTag}>Add</button>
      </div>
    </div>
  )
}

export default TagInput
