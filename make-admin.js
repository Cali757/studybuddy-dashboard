// Script to make a user an admin
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeAdmin(email) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    
    // Update Firestore document
    await db.collection('users').doc(uid).set({
      email: email,
      role: 'admin'
    }, { merge: true });
    
    console.log(`Successfully made ${email} an admin!`);
    console.log(`UID: ${uid}`);
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit();
}

// Run with the email
const email = process.argv[2] || 'admin@test.com';
makeAdmin(email);
