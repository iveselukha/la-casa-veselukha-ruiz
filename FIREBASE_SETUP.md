# Firebase Setup Guide for La Casa Bookings

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "la-casa-bookings")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In your Firebase project, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location (choose the closest to your users)
5. Click "Done"

## Step 3: Get Your Firebase Config

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "la-casa-web")
6. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Update Your Firebase Config

1. Open `src/lib/firebase.ts`
2. Replace the placeholder values with your actual Firebase config
3. Save the file

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Go to your app and try to submit a booking
3. Check the Firebase Console > Firestore Database to see if the booking was saved
4. Visit `/admin` in your app to see the admin panel

## Step 6: Set up Email Notifications (Optional)

For email notifications, you can use:
- **Firebase Functions** with SendGrid
- **EmailJS** (client-side)
- **Formspree** or **Netlify Forms**

## Step 7: Secure Your Database (Important!)

1. In Firebase Console > Firestore Database > Rules
2. Replace the test rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      allow read, write: if true; // For now, allow all access
      // Later, you can add authentication rules
    }
  }
}
```

## Admin Access

- Visit `http://localhost:5173/admin` to access the admin panel
- You can view, confirm, cancel, and delete bookings

## Troubleshooting

- **"Firebase not initialized"**: Check your config in `src/lib/firebase.ts`
- **"Permission denied"**: Check your Firestore rules
- **"Network error"**: Make sure your Firebase project is in the correct region

## Next Steps

1. Add authentication for admin access
2. Set up email notifications
3. Add booking validation
4. Customize the admin panel
5. Add analytics and reporting

## Support

If you need help, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore) 