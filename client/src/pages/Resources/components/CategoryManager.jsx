function CategoryManager({ categories, draft, onDraft, onCreate, onDelete }) {
  return (
    <section className="category-manager">
      <header>
        <div>
          <h2>Categories</h2>
          <p>Organize resources for teachers and students.</p>
        </div>
      </header>
      <form onSubmit={onCreate}>
        <input
          value={draft.name}
          onChange={(event) => onDraft({ ...draft, name: event.target.value })}
          placeholder="Category name"
          required
        />
        <input
          value={draft.description}
          onChange={(event) => onDraft({ ...draft, description: event.target.value })}
          placeholder="Short description"
        />
        <button type="submit">Add Category</button>
      </form>
      <div className="category-manager-list">
        {categories.length === 0 ? (
          <span>No categories yet.</span>
        ) : (
          categories.map((category) => (
            <article key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <span>{category.description || 'No description'}</span>
              </div>
              <button type="button" onClick={() => onDelete(category)}>Delete</button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default CategoryManager
