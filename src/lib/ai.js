const BASE_URL = "https://us-central1-mywebapp-99a71.cloudfunctions.net";

export async function getSummary(transcript) {
  const res = await fetch(`${BASE_URL}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  return res.json();
}

export async function askQuestion(transcript, question) {
  const res = await fetch(`${BASE_URL}/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, question }),
  });

  return res.json();
}

export async function getQuiz(transcript) {
  const res = await fetch(`${BASE_URL}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  return res.json();
}
