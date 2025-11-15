import React, { useState } from "react";
import { Input } from "./ui/Input";
import { TextArea } from "./ui/TextArea";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";

/** PUBLIC_INTERFACE
 * SnippetEditor provides validation and tag management for create/edit.
 */
export function SnippetEditor({ initial = {}, onSubmit, submitting }) {
  const [title, setTitle] = useState(initial.title || "");
  const [author, setAuthor] = useState(initial.author || "");
  const [bookTitle, setBookTitle] = useState(initial.bookTitle || "");
  const [content, setContent] = useState(initial.content || "");
  const [tags, setTags] = useState(Array.isArray(initial.tags) ? initial.tags : []);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (title.length > 120) e.title = "Title is too long (max 120 chars).";
    if (!content.trim()) e.content = "Content is required.";
    if (content.length > 5000) e.content = "Content exceeds 5000 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ title: title.trim(), author: author.trim(), bookTitle: bookTitle.trim(), content: content.trim(), tags });
  };

  return (
    <form onSubmit={submit} noValidate>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <Input label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <Input label="Book Title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
      <TextArea label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} error={errors.content} />
      <div style={{ marginTop: 8 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Tags</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" ? (e.preventDefault(), handleAddTag()) : null} />
          <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {tags.map((t) => <Tag key={t} label={t} onRemove={() => setTags(tags.filter(x => x !== t))} />)}
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
