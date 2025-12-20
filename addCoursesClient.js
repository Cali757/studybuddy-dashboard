// Simple script to add courses to Firestore using Firebase client SDK
// Run this with: node addCoursesClient.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const courses = [
  {
    title: 'Boss Dispatching 2025 subs',
    link: 'https://drive.google.com/drive/folders/1Hhy7W81XJCrwam6suUhk8ArRVkf-xQXs?usp=drive_link',
    description: 'Comprehensive course on Boss Dispatching for 2025'
  },
  {
    title: 'Boss dispatching Shortcut 2025-subs',
    link: 'https://drive.google.com/drive/folders/1Nlbnm01kXaDl_42874lJ4Qgavd8Tpl7Z?usp=drive_link',
    description: 'Shortcut course for Boss Dispatching 2025'
  },
  {
    title: 'Boss Trucking Academy-subs',
    link: 'https://drive.google.com/drive/folders/17hej598RpwYBJUNS0KDeqnLZW3ugLafr?usp=drive_link',
    description: 'Boss Trucking Academy comprehensive course'
  },
  {
    title: 'Freight Broker Course (Monthly Installment)',
    link: 'https://drive.google.com/drive/folders/12Buq7N3gNPkKN52_yPj_Z83Q874dqQPs?usp=drive_link',
    description: 'Freight Broker Course with monthly installment option'
  },
  {
    title: 'Mastering Freight Brokering and Dispatching',
    link: 'https://drive.google.com/drive/folders/11eftPQ1NCeSO7sa1Owu9Tf_69l2Vmqdn?usp=drive_link',
    description: 'Master course on Freight Brokering and Dispatching'
  },
  {
    title: 'Trucking Academy Short cut 2025',
    link: 'https://drive.google.com/drive/folders/1k-XtVldoa7ZU1NQ8jTPe9qqwITZi76zS?usp=drive_link',
    description: 'Shortcut course for Trucking Academy 2025'
  }
];

async function addCourses() {
  try {
    console.log('Starting to add courses to Firestore...');
    
    for (const course of courses) {
      const lessonData = {
        lessonId: course.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
        title: course.title,
        transcript: `Course Link: ${course.link}\n\n${course.description}. Access the full course materials through the Google Drive link above.`,
        summary: course.description,
        driveLink: course.link,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'lessons'), lessonData);
      console.log(`✓ Added course: ${course.title} with ID: ${docRef.id}`);
    }
    
    console.log('\n✓ All 6 courses added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding courses:', error);
    process.exit(1);
  }
}

addCourses();
