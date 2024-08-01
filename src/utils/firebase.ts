// import { FirebaseOptions, initializeApp } from "firebase/app"
// import { collection, getFirestore } from "firebase/firestore"
// import { config } from "dotenv"

// config()

// const FIREBASE_CONFIG: FirebaseOptions = {
//     apiKey: process.env.VITE_OPS_FIREBASE_API_KEY,
//     authDomain: process.env.VITE_OPS_FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.VITE_OPS_FIREBASE_DATABASE_URL,
//     projectId: process.env.VITE_OPS_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.VITE_OPS_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.VITE_OPS_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.VITE_OPS_FIREBASE_APP_ID,
//     measurementId: process.env.VITE_OPS_FIREBASE_MEASUREMENT_ID
// }

// const app = initializeApp(FIREBASE_CONFIG)
// export const db = getFirestore(app)

// export const DBUsers = "users"
// export const usersCollectionRef = collection(db, DBUsers)

// export const DBBills = "bills"
// export const billsCollectionRef = collection(db, DBBills)

// export const DBStores = "stores"
// export const storesCollectionRef = collection(db, DBStores)

// export const DBLottos = "lottos"
// export const lottosCollectionRef = collection(db, DBLottos)

// export const DBRates = "rates"
// export const ratesCollectionRef = collection(db, DBRates)

// export const DBDigitsSemi = "digits_semi"
// export const digitsSemiCollectionRef = collection(db, DBDigitsSemi)

// export const DBDigitsClose = "digits_close"
// export const digitsCloseCollectionRef = collection(db, DBDigitsClose)

// export const DBCheckRewards = "check_rewards"
// export const checkRewardsCollectionRef = collection(db, DBCheckRewards)

// export const DBCommittions = "committions"
// export const committionsCollectionRef = collection(db, DBCommittions)
