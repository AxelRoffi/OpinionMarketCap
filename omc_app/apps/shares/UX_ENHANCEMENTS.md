# UX Enhancements - Answer Shares

Track planned UX improvements for the Answer Shares app.

---

## URL Structure

### Current
```
/questions/1
```

### Proposed
```
/questions/1-most-powerful-person-in-the-world
```

**Benefits:**
- More readable/shareable URLs
- Better SEO
- Users can understand the content from the URL

**Implementation:**
- Generate slug from question text (lowercase, hyphens, truncate)
- URL format: `/questions/[id]-[slug]`
- Route should extract ID from the beginning, ignore slug for routing
- Redirect if slug is missing or incorrect

---

## Other Planned Enhancements

- [ ] URL slugs for questions (described above)
- [ ] Toast notifications for successful transactions
- [ ] Loading skeletons for all data fetches
- [ ] Mobile-optimized bottom sheet modals
- [ ] Share buttons for questions/answers
- [ ] Price charts/history for answers
