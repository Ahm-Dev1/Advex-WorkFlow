import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// TODO: أدخل إعدادات مشروع Firebase الخاص بك هنا
// 1. انتقل إلى وحدة تحكم Firebase (https://console.firebase.google.com/)
// 2. أنشئ مشروعًا جديدًا أو حدد مشروعًا موجودًا.
// 3. انتقل إلى "إعدادات المشروع" (Project Settings).
// 4. في قسم "تطبيقاتك" (Your apps)، ابحث عن كائن إعداد SDK (firebaseConfig).
// 5. انسخ القيم والصقها في الكائن أدناه.
// =================================================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // أدخل هنا
  authDomain: "YOUR_AUTH_DOMAIN", // أدخل هنا
  projectId: "YOUR_PROJECT_ID", // أدخل هنا
  storageBucket: "YOUR_STORAGE_BUCKET", // أدخل هنا
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // أدخل هنا
  appId: "YOUR_APP_ID" // أدخل هنا
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export firestore database instance
export const db = getFirestore(app);