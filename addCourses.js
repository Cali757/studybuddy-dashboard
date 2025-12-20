const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
    for (const course of courses) {
      const docRef = await db.collection('lessons').add({
        lessonId: course.title.toLowerCase().replace(/\s+/g, '-'),
        title: course.title,
        content: `Course Link: ${course.link}\n\n${course.description}. Access the full course materials through the Google Drive link above.`,
        driveLink: course.link,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added course: ${course.title} with ID: ${docRef.id}`);
    }
    console.log('All courses added successfully!');
  } catch (error) {
    console.error('Error adding courses:', error);
  } finally {
    process.exit();
  }
}

addCourses();