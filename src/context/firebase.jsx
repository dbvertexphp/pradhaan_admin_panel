import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  collection,
	doc,
  query,
  orderBy,
  addDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCN2Q-jQqFJUzpHohPD16CJV4LwKg6nvf8",
  authDomain: "chunaw-a66df.firebaseapp.com",
  projectId: "chunaw-a66df",
  storageBucket: "chunaw-a66df.appspot.com",
  messagingSenderId: "379389559599",
  appId: "1:379389559599:web:e3788d2d8872cf629d17da",
};

export const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp); // Initialize Firestore here
const FirebaseContext = createContext(null);
export const storage = getStorage(firebaseApp);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
  const [polls, setPolls] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [pradhaanData, setPradhaanData] = useState([]);
  const [states, setStates] = useState([]);

  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const getPolls = async () => {
    try {
      const pollsCollectionRef = collection(firestore, "polls");
      const pollsSnapshot = await getDocs(pollsCollectionRef);
      const pollsData = pollsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolls(pollsData);
    } catch (error) {
      console.error("Error getting polls: ", error);
    }
  };

  const getSponsors = async () => {
    try {
      const sponsorsCollectionRef = collection(firestore, "sponsor");
      const sponsorsQuery = query(
        sponsorsCollectionRef,
        orderBy("createdAt", "desc")
      );
      const sponsorsSnapshot = await getDocs(sponsorsQuery);
      const sponsorsData = sponsorsSnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = formatTimestamp(data.createdAt);
        }
        return {
          id: doc.id,
          ...data,
        };
      });
      setSponsors(sponsorsData);
    } catch (error) {
      console.error("Error getting sponsors: ", error);
    }
  };

  const getTransactionHistory = async () => {
    try {
      const transactionHistoryCollectionRef = collection(
        firestore,
        "transaction_history"
      );
      const transactionHistoryQuery = query(
        transactionHistoryCollectionRef,
        orderBy("createdAt", "desc")
      );
      const transactionHistorySnapshot = await getDocs(transactionHistoryQuery);

      const transactionHistoryData = await Promise.all(
        transactionHistorySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate();
          }

          // Fetch bank details based on the uid
          const bankDetails = await getBankDetails(data.uid);

          return {
            id: doc.id,
            amount: data.amount || 0,
            createdAt: data.createdAt || null,
            failed: data.failed || false,
            note: data.note || "",
            status: data.status || false,
            uid: data.uid || "",
            bankDetails: bankDetails || {}, // Add bank details to the transaction data
          };
        })
      );

      return transactionHistoryData;
    } catch (error) {
      console.error("Error getting transaction history: ", error);
      return [];
    }
  };

  const getBankDetails = async (id) => {
    try {
      const bankDetailsCollectionRef = collection(firestore, "bankdetails");
      const bankDetailsDocRef = doc(bankDetailsCollectionRef, id); // Get document reference by ID
      const bankDetailsDoc = await getDoc(bankDetailsDocRef); // Fetch the document

      if (bankDetailsDoc.exists()) {
        const bankData = bankDetailsDoc.data();
        return {
          accountNumber: bankData.account_number || "",
          bankAddress: bankData.bank_address || "",
          bankName: bankData.bank_name || "",
          ifscNumber: bankData.ifsc_number || "",
          yourName: bankData.your_name || "",
        };
      } else {
        return null; // No bank details found for this ID
      }
    } catch (error) {
      console.error("Error getting bank details: ", error);
      return null;
    }
  };

  const getPradhanData = async () => {
    try {
      const pradhanCollectionRef = collection(firestore, "pradhan");
      const pradhanSnapshot = await getDocs(pradhanCollectionRef);

      const pradhanData = pradhanSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            locationText: data.locationText,
            pradhan_id: data.pradhan_id,
            pradhan_model: data.pradhan_model,
            image: data.image,
            name: data.name,
            username: data.username,
            voting: data.voting,
            level: data.level,
          };
        })
        .filter(
          (pradhan) => pradhan.pradhan_id !== null && pradhan.pradhan_id !== ""
        );

      // Fetch Ads Data
      const adsData = await getAdsData(); // Fetch the ads data from Firestore

      // Calculate Total Earnings
      const earningsData = pradhanData.map((pradhan) => {
        // Filter ads matching pradhan_id with uid
        const matchedAds = adsData.filter(
          (ad) => ad.uid === pradhan.pradhan_id
        );

        // Calculate total earnings for matched ads
        const totalEarnings = matchedAds.reduce((total, ad) => {
          const earning =
            (ad.target_views / ad.proposed_amount) * ad.generated_views;
          return total + earning;
        }, 0);

        return {
          ...pradhan,
          totalEarnings, // Add the calculated total earnings to pradhan object
        };
      });

      setPradhaanData(earningsData); // Update state with pradhan data including total earnings
      return earningsData; // Return data so it can be used directly if needed
    } catch (error) {
      console.error("Error getting pradhaan data: ", error);
    }
  };

  const getAdsData = async () => {
    try {
      const adsCollectionRef = collection(firestore, "ads"); // Adjust 'ads' to your actual collection name
      const adsSnapshot = await getDocs(adsCollectionRef);

      return adsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), // Spread the data fields from the document
      }));
    } catch (error) {
      console.error("Error getting ads data: ", error);
      return []; // Return an empty array on error
    }
  };

  const getStatesData = async () => {
    try {
      const statesCollectionRef = collection(
        firestore,
        "location",
        "1-India",
        "State"
      );
      const statesSnapshot = await getDocs(statesCollectionRef);
      const statesData = statesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStates(statesData);
      return statesData;
    } catch (error) {
      console.error("Error getting states data: ", error);
      return []; // Return an empty array on error
    }
  };

  const getCitiesData = async (stateId) => {
    try {
      const citiesCollectionRef = collection(
        firestore,
        "location",
        "1-India",
        "State",
        stateId,
        "city"
      );

      const citiesSnapshot = await getDocs(citiesCollectionRef);
      const citiesData = citiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return citiesData; // Return the fetched cities data
    } catch (error) {
      console.error("Error getting cities data: ", error);
      return []; // Return an empty array on error
    }
  };

  const getPostalData = async (stateId, cityId) => {
    try {
      const citiesCollectionRef = collection(
        firestore,
        "location",
        "1-India",
        "State",
        stateId,
        "city",
        cityId,
        "postal"
      );

      const postalSnapshot = await getDocs(citiesCollectionRef);
      const postalData = postalSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return postalData; // Return the fetched cities data
    } catch (error) {
      console.error("Error getting postal data: ", error);
      return []; // Return an empty array on error
    }
  };

  const addRideDetails = async (rideData) => {
    try {
      // Reference to the rides collection for the specific city
      const ridesCollectionRef = collection(firestore, "dailyrides");
      // Add a new document with an auto-generated ID
      const docRef = await addDoc(ridesCollectionRef, rideData);
      return docRef.id; // Return the generated ride ID
    } catch (error) {
      console.error("Error adding ride details: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const addPromoters = async (promoterData, contactData) => {
      try {
        const promotersCollectionRef = collection(firestore, "external_promoters");

        const docRef = await addDoc(promotersCollectionRef, promoterData);

        console.log(`Promoter added with ID: ${docRef.id}`);

        const contactDocRef = firestoreDoc(firestore, "contacts", docRef.id);
        await setDoc(contactDocRef, {
          ...contactData,
        });

        console.log("Contact added successfully under promoter.");

        return docRef.id;
      } catch (error) {
        console.error("Error adding promoter and contact details:", error);
        throw error;
      }
    };

  const addAutoDetails = async (autoData) => {
    try {
      // Reference to the rides collection for the specific city
      const ridesCollectionRef = collection(firestore, "autolocations");
      // Add a new document with an auto-generated ID
      const docRef = await addDoc(ridesCollectionRef, autoData);
      return docRef.id; // Return the generated ride ID
    } catch (error) {
      console.error("Error adding ride details: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAllAuto = async () => {
    try {
      // Reference to the 'autolocations' collection in Firestore
      const autoCollectionRef = collection(firestore, "autolocations");

      // Get all the documents from the collection
      const querySnapshot = await getDocs(autoCollectionRef);

      // Map the documents to an array of ride objects
      const auto = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return auto; // Return the array of rides
    } catch (error) {
      console.error("Error getting auto details: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAutoById = async (id) => {
    try {
      // Reference to the specific document in the 'autolocations' collection
      const autoDocRef = firestoreDoc(firestore, "autolocations", id);

      // Get the document data
      const docSnapshot = await getDoc(autoDocRef);

      if (docSnapshot.exists()) {
        // Return the data if the document exists
        return { id: docSnapshot.id, ...docSnapshot.data() };
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting auto details by id: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const updateAutoById = async (id, updatedData) => {
    try {
      // Reference to the specific document in the 'autolocations' collection
      const autoDocRef = firestoreDoc(firestore, "autolocations", id);

      // Update the document with the new data
      await updateDoc(autoDocRef, updatedData);

      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating auto details by id: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAllRides = async () => {
    try {
      // Reference to the 'dailyrides' collection in Firestore
      const ridesCollectionRef = collection(firestore, "dailyrides");

      // Get all the documents from the collection
      const querySnapshot = await getDocs(ridesCollectionRef);

      // Map the documents to an array of ride objects
      const rides = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return rides; // Return the array of rides
    } catch (error) {
      console.error("Error getting rides details: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  //   const getAllPosts = async () => {
  //     try {
  //       // Reference to the 'posts' collection in Firestore
  //       const postCollectionRef = collection(firestore, "posts");

  //       // Get all the documents from the collection
  //       const querySnapshot = await getDocs(postCollectionRef);

  //       // Map the documents to an array of ride objects
  //       const posts = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       console.log(posts);

  //       return posts; // Return the array of rides
  //     } catch (error) {
  //       console.error("Error getting post: ", error);
  //       throw error; // Rethrow the error for further handling if needed
  //     }
  //   };

  const getAllPosts = async () => {
    try {
      // Reference to the 'posts' collection in Firestore
      const postCollectionRef = collection(firestore, "posts");

      // Get all the documents from the 'posts' collection
      const querySnapshot = await getDocs(postCollectionRef);

      // Map through each document in 'posts' and get related user data
      const posts = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const postData = { id: doc.id, ...doc.data() };

          // Reference to the user's document based on `user_id` from the post
          const userDocRef = firestoreDoc(firestore, "users", postData.user_id);

          // Fetch the user's document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            postData.userInfo = {
              affiliate_image: userDoc.data().affiliate_image,
              affiliate_text: userDoc.data().affiliate_text,
              city: userDoc.data().city,
              country: userDoc.data().country,
              image: userDoc.data().image,
              level: userDoc.data().level,
              name: userDoc.data().name,
              state: userDoc.data().state,
              userdesc: userDoc.data().userdesc,
              username: userDoc.data().username,
            };
          } else {
            postData.userInfo = null; // If user does not exist
          }

          return postData;
        })
      );

      console.log(posts);
      return posts;
    } catch (error) {
      console.error("Error getting posts or user info: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAllAds = async () => {
    try {
      // Reference to the 'posts' collection in Firestore
      const adsCollectionRef = collection(firestore, "ads");

      // Get all the documents from the 'posts' collection
      const querySnapshot = await getDocs(adsCollectionRef);

      // Map through each document in 'posts' and get related user data
      const ads = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const adsData = { id: doc.id, ...doc.data() };

          // Reference to the user's document based on `user_id` from the post
          const userDocRef = firestoreDoc(firestore, "users", adsData.uid);

          // Fetch the user's document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            adsData.userInfo = {
              affiliate_image: userDoc.data().affiliate_image,
              affiliate_text: userDoc.data().affiliate_text,
              city: userDoc.data().city,
              country: userDoc.data().country,
              image: userDoc.data().image,
              level: userDoc.data().level,
              name: userDoc.data().name,
              state: userDoc.data().state,
              userdesc: userDoc.data().userdesc,
              username: userDoc.data().username,
            };
          } else {
            adsData.userInfo = null; // If user does not exist
          }

          return adsData;
        })
      );

      return ads;
    } catch (error) {
      console.error("Error getting ads or user info: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAllDonations = async () => {
    try {
      // Reference to the 'donations' collection in Firestore
      const donationCollectionRef = collection(firestore, "donations");

      // Get all the documents from the 'donations' collection
      const querySnapshot = await getDocs(donationCollectionRef);

      // Map through each document in 'donations' and get related user data
      const donations = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const donationData = { id: doc.id, ...doc.data() };

          // Ensure `user_id` exists in the donation data
          const userId = donationData.by; // Assuming 'user_id' is the field in the donation document

          if (userId) {
            // Reference to the user's document based on `user_id` from the donation
            const userDocRef = firestoreDoc(firestore, "users", userId);

            // Fetch the user's document
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              donationData.userInfo = {
                affiliate_image: userDoc.data().affiliate_image,
                affiliate_text: userDoc.data().affiliate_text,
                city: userDoc.data().city,
                country: userDoc.data().country,
                image: userDoc.data().image,
                level: userDoc.data().level,
                name: userDoc.data().name,
                state: userDoc.data().state,
                userdesc: userDoc.data().userdesc,
                username: userDoc.data().username,
              };
            } else {
              donationData.userInfo = null; // If user does not exist
            }
          } else {
            donationData.userInfo = null; // If no user_id exists in donation data
          }

          return donationData; // Return the updated donation data with userInfo
        })
      );

      return donations;
    } catch (error) {
      console.error("Error getting donations or user info: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  const getAllPromoters = async () => {
    try {
      const promotersCollectionRef = collection(
        firestore,
        "external_promoters"
      );

      const querySnapshot = await getDocs(promotersCollectionRef);

      // Map through each document in 'external_promoters' and return the data
      const promoters = querySnapshot.docs.map((doc) => {
        const promotersData = { id: doc.id, ...doc.data() };
        return promotersData;
      });

      return promoters;
    } catch (error) {
      console.error("Error getting promoters: ", error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

  useEffect(() => {
    getPolls();
    getSponsors();
    getTransactionHistory();
    getPradhanData();
    getStatesData();
    getCitiesData();
    addRideDetails();
    getAllRides();
    getAllPosts();
    getAllAds();
    addAutoDetails();
    getAllAuto();
    getAutoById();
    updateAutoById();
    getAllDonations();
    getPostalData();
    addPromoters();
    getAllPromoters();
    getAllPromoters();
  }, [firestore]);

  const contextValue = {
    auth,
    firestore,
    getReportsWithPosts: async () => {
      try {
        const reportsCollectionRef = collection(firestore, "reports");
        const querySnapshot = await getDocs(reportsCollectionRef);

        const reportsWithPosts = await Promise.all(
          querySnapshot.docs.map(async (reportDoc) => {
            const reportData = { id: reportDoc.id, ...reportDoc.data() };

            const postDoc = await getDoc(
              doc(firestore, "posts", reportData.postId)
            );
            const postData = postDoc.exists() ? postDoc.data() : null;

            const byCollectionRef = collection(reportDoc.ref, "by");
            const byQuerySnapshot = await getDocs(byCollectionRef);
            const byData = byQuerySnapshot.docs.map((doc) => doc.data());

            const reasonCounts = {};
            byData.forEach((data) => {
              const { reason } = data;
              reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
            });

            return { ...reportData, post: postData, by: byData, reasonCounts };
          })
        );

        return reportsWithPosts;
      } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
      }
    },
    polls,
    getPolls,
    sponsors,
    getSponsors,
    getTransactionHistory,
    pradhaanData,
    getPradhanData, // Export getPradhanData here
    getStatesData,
    getCitiesData,
    addRideDetails,
    getAllRides,
    getAllPosts,
    getAllAds,
    addAutoDetails,
    getAllAuto,
    getAutoById,
    updateAutoById,
    getAllDonations,
    getPostalData,
    addPromoters,
    getAllPromoters,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {props.children}
    </FirebaseContext.Provider>
  );
};
