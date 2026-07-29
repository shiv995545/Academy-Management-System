function CategorySelector({ categories, value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Select category</option>
      {categories.map((category) => (
        <option key={category.id || category.name} value={category.name}>
          {category.name}
        </option>
      ))}
      <option value="NCERT Solutions">NCERT Solutions</option>
      <option value="Worksheets">Worksheets</option>
      <option value="Video Lessons">Video Lessons</option>
      <option value="Quizzes">Quizzes</option>
      <option value="Parent Resources">Parent Resources</option>
    </select>
  )
}

export default CategorySelector
