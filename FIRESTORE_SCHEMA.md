# Firestore Schema Documentation

## Collections

### quizzes

Stores quiz results and user progress.

**Fields:**
- `uid` (string): User ID who took the quiz
- `lessonId` (string): ID of the lesson the quiz is for
- `score` (number): Score achieved on the quiz (0-100)
- `createdAt` (timestamp): When the quiz was completed

**Example Document:**
```json
{
  "uid": "user123",
  "lessonId": "lesson456",
  "score": 85,
  "createdAt": "2025-12-19T10:30:00Z"
}
```

**Frontend Implementation:**
After quiz submission, save the score using:

```typescript
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const saveQuizResult = async (uid: string, lessonId: string, score: number) => {
  const db = getFirestore();
  await addDoc(collection(db, 'quizzes'), {
    uid,
    lessonId,
    score,
    createdAt: serverTimestamp()
  });
};
```

### lessons

Stores lesson content and auto-generated summaries.

**Fields:**
- `lessonId` (string): Unique lesson identifier
- `transcript` (string): Lesson transcript text
- `summary` (string): Auto-generated summary (added by Cloud Function)

**Example Document:**
```json
{
  "lessonId": "lesson456",
  "transcript": "Full lesson transcript...",
  "summary": "• Point 1\n• Point 2\n• Point 3\n• Point 4\n• Point 5"
}
```
