function FileUploader({ file, uploading, onFile, onUpload }) {
  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.mp4"
        onChange={(event) => onFile(event.target.files?.[0] || null)}
      />
      <button type="button" onClick={onUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
      {file && <span>{file.name}</span>}
    </div>
  )
}

export default FileUploader
