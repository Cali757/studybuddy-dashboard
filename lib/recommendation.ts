export function getRecommendation(score: number) {
  if (score < 70) {
    return "Review the summary and retry the quiz.";
  }
  return "Great job! Move on to the next lesson.";
}
